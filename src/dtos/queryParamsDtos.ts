export class PageQueryParamDTO {
  page: number;

  constructor(page: string) {
    this.page = Number(page) || 1;
  }
}

export class LimitQueryParamDTO {
  limit: number;

  constructor(limit: string) {
    this.limit = Number(limit);
  }
}
