import { cache } from '../../helpers/cache.helper';

import { AppDataSource } from '../../data-source';
import { AuditUsers } from '../../entities/embedded/audit.entity';
import { Consumer } from './consumer.entity';
import { ConsumerSchema } from './consumer.schema';
import { parseError } from '../../helpers/error.helper';
import { ApiResponse } from '../../responses/api-response';
import { ApiStatus } from '../../responses/api-status';

export class ConsumerService {
  private static readonly consumerRepository = AppDataSource.getRepository(Consumer);

  static async getAllConsumers(companyId: string): Promise<ApiResponse<Consumer[]>> {
    const data = await cache.get<Consumer[]>(`consumers_${companyId}`);
    if (data) {
      return { success: true, message: 'Serving consumers from cache', data, status: ApiStatus.OK };
    }
    const consumers = await this.consumerRepository.find({
      select: ['consumerId', 'name', 'address', 'contact', 'isActive'],
      where: { companyId },
      order: { companyId: 'ASC', consumerId: 'ASC' }
    });
    await cache.set(`consumers_${companyId}`, consumers);
    return { success: true, message: 'Serving consumers from database', data: consumers, status: ApiStatus.OK };
  }

  static async getConsumerById(companyId: string, consumerId: string): Promise<ApiResponse<Consumer>> {
    const data = await cache.get<Consumer>('consumers:' + consumerId);
    if (data) {
      return { success: true, message: 'Serving a consumer from cache', data, status: ApiStatus.OK };
    }
    const consumer = await this.consumerRepository.findOne({
      select: ['consumerId', 'name', 'address', 'contact', 'isActive'],
      where: { companyId, consumerId }
    });
    if (!consumer) {
      return { success: false, message: `Consumer with id '${consumerId}' not found`, status: ApiStatus.NOT_FOUND };
    }
    await cache.set('consumers:' + consumerId, consumer);
    return { success: true, message: 'Serving consumer from database', data: consumer, status: ApiStatus.OK };
  }

  static async createConsumer(companyId: string, consumer: Consumer, userId: string): Promise<ApiResponse<Consumer>> {
    const parsedResult = ConsumerSchema.safeParse(consumer);
    if (!parsedResult.success) {
      return { success: false, message: parseError(parsedResult), status: ApiStatus.BAD_REQUEST };
    }

    const parsedConsumer = parsedResult.data as Consumer;
    parsedConsumer.companyId = companyId;
    parsedConsumer.user = { created: userId, updated: userId } as AuditUsers;
    const createConsumer = this.consumerRepository.create(parsedConsumer);
    const newConsumer = await this.consumerRepository.save<Consumer>(createConsumer);
    this.invalidateCache(companyId);
    return { success: true, message: 'Consumer created successfully', data: newConsumer, status: ApiStatus.CREATED };
  }

  static async updateConsumer(companyId: string, consumerId: string, consumer: Partial<Consumer>, userId: string): Promise<ApiResponse<Consumer>> {
    const dbConsumer = await this.consumerRepository.findOneBy({ companyId, consumerId });
    if (!dbConsumer) {
      return { success: false, message: `Consumer with id '${consumerId}' not found`, status: ApiStatus.NOT_FOUND };
    }

    const auditUsers: AuditUsers = { ...dbConsumer.user, updated: userId };
    const updateConsumer = { ...dbConsumer, ...consumer, user: auditUsers };
    const parsedResult = ConsumerSchema.safeParse(updateConsumer);
    if (!parsedResult.success) {
      return { success: false, message: parseError(parsedResult), status: ApiStatus.BAD_REQUEST };
    }
    const parsedConsumer = parsedResult.data as Consumer;
    const updatedConsumer = await this.consumerRepository.save(parsedConsumer);
    this.invalidateCache(dbConsumer.companyId, consumerId);
    return {
      success: true,
      message: 'Consumer updated successfully',
      data: updatedConsumer,
      status: ApiStatus.OK
    };
  }

  static async deleteConsumer(companyId: string, consumerId: string): Promise<ApiResponse<Consumer>> {
    const consumer = await this.consumerRepository.findOneBy({ companyId, consumerId });
    if (!consumer) {
      return { success: false, message: `Consumer with id '${consumerId}' not found`, status: ApiStatus.NOT_FOUND };
    }
    await this.consumerRepository.remove(consumer);
    this.invalidateCache(consumer.companyId, consumerId);
    return { success: true, message: 'Consumer deleted successfully', data: consumer, status: ApiStatus.OK };
  }

  static async invalidateCache(companyId: string, consumerId?: string): Promise<void> {
    await cache.del(`consumers_${companyId}`);
    if (consumerId) await cache.del('consumers:' + consumerId);
  }
}
