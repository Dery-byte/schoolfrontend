import { Pipe, PipeTransform } from '@angular/core';

/** Counts how many biodata records in the list match the given hasReport value */
@Pipe({ name: 'reportFilter' })
export class ReportFilterPipe implements PipeTransform {
  transform(list: any[], hasReport: boolean): number {
    if (!list) return 0;
    return list.filter(b => b.hasReport === hasReport).length;
  }
}
