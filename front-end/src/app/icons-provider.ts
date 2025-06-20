import { type EnvironmentProviders, importProvidersFrom } from '@angular/core';
import {
  AppstoreOutline,
  ArrowLeftOutline,
  ArrowRightOutline,
  BankOutline,
  CheckOutline,
  CloseOutline,
  DashboardOutline,
  DeleteOutline,
  EditOutline,
  InfoCircleOutline,
  LoadingOutline,
  LockOutline,
  LogoutOutline,
  MailOutline,
  MenuFoldOutline,
  MenuUnfoldOutline,
  PlusOutline,
  PrinterOutline,
  RightCircleOutline,
  SettingOutline,
  ShopOutline,
  SwapOutline,
  UserOutline,
} from '@ant-design/icons-angular/icons';
import { NzIconModule } from 'ng-zorro-antd/icon';

const icons = [
  MenuFoldOutline,
  MenuUnfoldOutline,
  DashboardOutline,
  UserOutline,
  MailOutline,
  LockOutline,
  ArrowRightOutline,
  RightCircleOutline,
  BankOutline,
  LoadingOutline,
  CheckOutline,
  CloseOutline,
  EditOutline,
  DeleteOutline,
  InfoCircleOutline,
  ArrowLeftOutline,
  AppstoreOutline,
  PlusOutline,
  SwapOutline,
  SettingOutline,
  LogoutOutline,
  ShopOutline,
  PrinterOutline,
];

export function provideNzIcons(): EnvironmentProviders {
  return importProvidersFrom(NzIconModule.forRoot(icons));
}
