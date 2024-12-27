import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { Organization } from '@models';
import { AuthService, LoginResponseData, OrganizationService } from '@services';

@Component({
  selector: 'app-select-organization',
  standalone: true,
  imports: [CommonModule, NzDropDownModule, NzIconModule, NzButtonModule],
  templateUrl: './select-organization.component.html',
  styleUrl: './select-organization.component.scss',
})
export class SelectOrganizationComponent {
  user: LoginResponseData;
  organizations: Organization[] = [];
  softColors = [
    '#FFB3BA',
    '#FFDFBA',
    '#FFFFBA',
    '#BAFFC9',
    '#BAE1FF',
    '#D4E157',
    '#81C784',
    '#4FC3F7',
    '#4DD0E1',
    '#7986CB',
    '#F8BBD0',
    '#C5CAE9',
    '#DCEDC8',
    '#FFE0B2',
    '#FFCCBC',
    '#FFEBEE',
    '#FFF3E0',
    '#E8F5E9',
    '#E3F2FD',
    '#F3E5F5',
    '#F5F5F5',
    '#EEEEEE',
    '#E0E0E0',
    '#D6D6D6',
    '#CCCCCC',
  ];
  colorStyles: {
    backgroundColor: string;
    color: string;
    border: string;
  }[] = [];

  constructor(
    private router: Router,
    private _orgService: OrganizationService,
    protected auth: AuthService
  ) {
    this.auth.getUser().subscribe({
      next: (value) => {
        this.user = value;
      },
    });
    sessionStorage.removeItem('organization');
    this._orgService.getAll({ field: 'isActive', value: true }).subscribe({
      next: ({ data }) => {
        if (data.length === 0) {
          this.router.navigate(['/home/organization/add']);
          return;
        }
        this.organizations = data;
        this.colorStyles = this.getColorStyles();
      },
    });
  }

  getRandomSoftColor(): string {
    const randomIndex = Math.floor(Math.random() * this.softColors.length);
    return this.softColors[randomIndex];
  }

  getLuminance(hex: string): number {
    const rgb = parseInt(hex.substring(1), 16); // Convert hex to RGB
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    // Calculate luminance
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance / 255;
  }

  getTextColor(backgroundColor: string): string {
    const luminance = this.getLuminance(backgroundColor);
    return luminance > 0.5 ? '#000000' : '#FFFFFF'; // Black or White
  }

  // Method to generate color styles for each organization
  getColorStyles() {
    return this.organizations.map((org) => {
      const bgColor = this.getRandomSoftColor();
      return {
        backgroundColor: bgColor,
        color: this.getTextColor(bgColor),
        border: '2px solid ' + this.darkenColor(bgColor, 30),
      };
    });
  }
  darkenColor(color: string, amount: number): string {
    let usePound = false;
    if (color[0] === '#') {
      color = color.slice(1);
      usePound = true;
    }

    let num = parseInt(color, 16);

    let r = (num >> 16) - amount;
    if (r < 0) r = 0;
    else if (r > 255) r = 255;

    let g = ((num >> 8) & 0x00ff) - amount;
    if (g < 0) g = 0;
    else if (g > 255) g = 255;

    let b = (num & 0x0000ff) - amount;
    if (b < 0) b = 0;
    else if (b > 255) b = 255;

    return (
      (usePound ? '#' : '') +
      ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')
    );
  }
}
