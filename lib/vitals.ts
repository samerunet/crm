import type { ReportHandler } from 'web-vitals';

export const reportWebVitals: ReportHandler = (metric) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(metric);
  }
};
