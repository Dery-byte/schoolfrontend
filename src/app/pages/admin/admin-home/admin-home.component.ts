import { Component } from '@angular/core';
import { ChartOptions, Chart, ChartDataset } from 'chart.js';


Chart.register()

import { forkJoin } from 'rxjs';
import { ManaulServiceService } from 'src/app/Utilities/manaul-service.service';

interface RevenueMonthly {
  month: number;
  totalAmount: number;
}

interface OrdersMonthly {
  month: number;
  totalOrders: number;
}

interface ReturnsMonthly {
  month: number;
  totalReturns: number;
}
@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent {

  
  totalOrders: any = 0;
  totalSales: any = 0;
  userSummary: any = {};
  totalClients: any = 0;

  constructor(private manualService: ManaulServiceService) {
    this.generateMonths();
    this.generateYears();
  }
  // Array of possible background colors
  colors = ['primary', 'secondary', 'success', 'info', 'warning', 'danger'];

  ngOnInit(): void {
    this.getTotalOrders();
    this.getTotalSales();
    this.getNonAdminLatestJoinedSummary();
    this.getTotalClients();


    // this.fetchMonthlyStats(new Date().getFullYear());
    // this.monthlyOrders(new Date().getFullYear());
    // this.monthlyReturns(new Date().getFullYear());
    this.getPaymentInfo();
  }
  paymentInfo: any;
  paginatedData: any[] = [];

  // Pagination settings
  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 1;
  isLoading = true;
  public Math = Math;

  getPaymentInfo() {
    this.isLoading = true;
    this.manualService.getAllPaymentInfo().subscribe({
      next: (data) => {
        this.paymentInfo = data;
        this.calculateTotalPages();
        this.updatePaginatedData();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching payment info:', error);
        this.isLoading = false;
      }
    });
  }

  calculateTotalPages() {
    this.totalPages = Math.ceil(this.paymentInfo.length / this.itemsPerPage);
    // Reset to page 1 if current page exceeds total pages
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
    }
  }

  updatePaginatedData() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedData = this.paymentInfo.slice(startIndex, endIndex);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedData();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedData();
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedData();
    }
  }

  getPageNumbers(): number[] {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }


  getTotalOrders() {
    this.manualService.getTotalOrders().subscribe((data: any) => {
      this.totalOrders = data;
    });
  }

  getTotalSales() {
    this.manualService.getTotalSales().subscribe((data: any) => {
      this.totalSales = data;
    });

  }


  getNonAdminLatestJoinedSummary() {
    this.manualService.getNonAdminSummary().subscribe((data: any) => {
      this.userSummary = data;
    });
  }

  getTotalClients() {
    this.manualService.getNonAdminCount().subscribe((data) => {
      this.totalClients = data;
    });
  }


  getInitials(fullName: string): string {
    if (!fullName) return '';
    const names = fullName.split(' ');
    return names.map(name => name[0]).join('').substring(0, 2);
  }

  getRandomColor(): string {
    return this.colors[Math.floor(Math.random() * this.colors.length)];
  }












  months: string[] = [];
  years: number[] = [];
  dailySales: any[] = [];


  selectedMonth: string | null = null;
  selectedYear: number | null = null;


  generateMonths(): void {
    this.months = Array.from({ length: 12 }, (_, i) =>
      new Date(0, i).toLocaleString('default', { month: 'long' })
    );
  }

  generateYears(): void {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  }

  selectMonth(month: string): void {
    this.selectedMonth = month;
    console.log('Selected month:', month);
    this.revenueFiltering();
  }

  selectYear(year: number): void {
    this.selectedYear = year;
    console.log('Selected year:', year);
    this.revenueFiltering();
  }




  // revFiltering(){
  //   this.manualService.revenueFiltering().subscribe((data:any)=>{

  //   });
  // }





  totalRevenue: number = 0;




  dataLoaded = false;
  noDataMessage: string = 'Daily revenue (Filter by Year and Month)';


  revenueFiltering(): void {
    if (this.selectedMonth && this.selectedYear !== null) {
      const monthIndex = this.months.indexOf(this.selectedMonth) + 1; // month as number
      const year = this.selectedYear;
      this.manualService.revenueFiltering(year, monthIndex)
        .subscribe({
          next: (data) => {

            this.dailySales = data as any[];
            this.totalRevenue = this.calculateTotalRevenue(this.dailySales);
            // ✅ control when to show the message
            this.dataLoaded = true;
            if (this.dailySales.length === 0) {
              this.noDataMessage = `No daily revenue currently for ${this.getMonthName(monthIndex)} ${year}`;
            }




            console.log('Weekly Revenue Data:', data);
            // handle/display revenue data
          },
          error: (err) => {
            console.error('Error fetching revenue:', err);
            this.dataLoaded = true;

          }
        });
    }
  }


  getMonthName(month: number): string {
    return new Date(0, month - 1).toLocaleString('default', { month: 'long' });
  }



  calculateTotalRevenue(sales: any[]): number {
    return sales.reduce((sum, s) => sum + s.totalAmount, 0);
  }












































  // THE DASHBOARD CHART






  exportData() {
    alert('Export triggered!');
  }

  printChart() {
    window.print();
  }




  public chartLabels: string[] = [];
  public chartData: ChartDataset<'line'>[] = [];
  


  getMonthsName(month: number): string {
    const date = new Date();
    date.setMonth(month - 1);
    return date.toLocaleString('default', { month: 'short' }); // e.g. "May"
  }


  public chartOptions: ChartOptions<'line'> = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      yRevenue: {
        type: 'linear',
        display: true,
        position: 'left',
        stacked: false,  // ✅ correct place
        title: {
          display: true,
          text: 'Revenue'
        }
      },
      yOrders: {
        type: 'linear',
        display: true,
        position: 'right',
        stacked: false,  // ✅ correct place
        grid: {
          drawOnChartArea: false
        },
        title: {
          display: true,
          text: 'Orders'
        }
      },
      yReturns: {
        type: 'linear',
        display: true,
        position: 'right',
        stacked: false,  // ✅ correct place
        grid: {
          drawOnChartArea: false
        },
        title: {
          display: true,
          text: 'Returns'
        },
        offset: true
      }
    }
  };


























  fetchMonthlyStats(year: number) {

    forkJoin({
      revenue: this.manualService.revenueMonthly(year),
      orders: this.manualService.monthlyOrders(year),
      returns: this.manualService.monthlyReturns(year)
    }).subscribe(
      ({
        revenue,
        orders,
        returns
      }: {
        revenue: RevenueMonthly[];
        orders: OrdersMonthly[];
        returns: ReturnsMonthly[];
      }) => {
        const fullYearData = Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          revenue: 0,
          orders: 0,
          returns: 0
        }));

        revenue.forEach((d: RevenueMonthly) => {
          const index = fullYearData.findIndex(f => f.month === d.month);
          if (index !== -1) fullYearData[index].revenue = d.totalAmount;
        });

        orders.forEach((d: OrdersMonthly) => {
          const index = fullYearData.findIndex(f => f.month === d.month);
          if (index !== -1) fullYearData[index].orders = d.totalOrders;
        });

        returns.forEach((d: ReturnsMonthly) => {
          const index = fullYearData.findIndex(f => f.month === d.month);
          if (index !== -1) fullYearData[index].returns = d.totalReturns;
        });
        this.selectedYear = year;


        this.chartLabels = fullYearData.map(d => this.getMonthName(d.month));











        this.chartData = [
          {
            label: 'Revenue',
            data: fullYearData.map(d => d.revenue),
            backgroundColor: 'rgba(75, 192, 192, 0.3)',
            borderColor: 'rgba(75, 192, 192, 1)',
            fill: true,
            tension: 0.4,
            pointBorderColor: '#00c0ef',
            yAxisID: 'yRevenue'
          },
          {
            label: 'Orders',
            data: fullYearData.map(d => d.orders),
            backgroundColor: 'rgba(255, 206, 86, 0.3)',
            borderColor: 'rgba(255, 206, 86, 1)',
            fill: true,
            pointBorderColor: '#f39c12',
            tension: 0.4,
            yAxisID: 'yOrders'
          },
          {
            label: 'Returns',
            data: fullYearData.map(d => d.returns),
            backgroundColor: 'rgba(255, 99, 132, 0.3)',
            borderColor: 'rgba(255, 99, 132, 1)',
            fill: true,
            tension: 0.4,
            pointBorderColor: '#ff6384',
            yAxisID: 'yReturns'
          }
        ];







      }
    );
  }






  

}
