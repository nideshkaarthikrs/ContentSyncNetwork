import { Injectable } from '@nestjs/common';

@Injectable()
export class FeedService {
  getFeed(page: number, pageSize: number, message: string) {
    return {
      status: 'SUCCESS',
      message,
      data: {
        page,
        pageSize,
        totalRecords: 0,
        data: [],
      },
    };
  }
}
