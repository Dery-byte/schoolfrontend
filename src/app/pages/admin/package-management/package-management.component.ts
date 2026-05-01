import { Component, OnInit } from '@angular/core';
import { PackageManagementService, PackageConfiguration, SubscriptionType, InstitutionTypeVisibility } from '../../../services/custom/package-management.service';

@Component({
  selector: 'app-package-management',
  templateUrl: './package-management.component.html',
  styleUrls: ['./package-management.component.css']
})
export class PackageManagementComponent implements OnInit {
  packages: PackageConfiguration[] = [];
  loading = false;
  message = '';
  
  subscriptionTypes = Object.values(SubscriptionType);
  visibilityOptions = Object.values(InstitutionTypeVisibility);

  constructor(private packageService: PackageManagementService) { }

  ngOnInit(): void {
    this.loadPackages();
  }

  loadPackages(): void {
    this.loading = true;
    this.packageService.getAllConfigurations().subscribe({
      next: (data: PackageConfiguration[]) => {
        this.packages = data;
        this.loading = false;
        this.ensureAllPackagesRepresented();
      },
      error: (err: any) => {
        console.error('Error loading packages', err);
        this.loading = false;
        this.message = 'Failed to load packages. Please check backend connection.';
      }
    });
  }

  ensureAllPackagesRepresented(): void {
    const typesInDb = this.packages.map(p => p.subscriptionType);
    this.subscriptionTypes.forEach(type => {
      if (!typesInDb.includes(type)) {
        this.packages.push({
          subscriptionType: type,
          price: 0,
          privateSchoolSlots: 0,
          publicSchoolSlots: 0,
          programsPerPrivateUniversity: 0,
          programsPerPublicUniversity: 0,
          maxCategorySelection: 0,
          visibility: InstitutionTypeVisibility.BOTH
        });
      }
    });
  }

  savePackage(config: PackageConfiguration): void {
    this.loading = true;
    this.packageService.updateConfiguration(config).subscribe({
      next: (res: PackageConfiguration) => {
        this.message = `Successfully updated ${config.subscriptionType}`;
        this.loading = false;
        setTimeout(() => this.message = '', 3000);
      },
      error: (err: any) => {
        console.error('Error updating package', err);
        this.message = `Error updating ${config.subscriptionType}`;
        this.loading = false;
      }
    });
  }
}
