import colleges from "../../data/colleges.seed.json";
import type { College } from "../../shared/types";

export class CollegeRepository {
  private readonly colleges: College[] = colleges as College[];

  getAll() {
    return this.colleges;
  }

  getById(id: string) {
    return this.colleges.find((college) => college.id === id) ?? null;
  }
}

export const collegeRepository = new CollegeRepository();
