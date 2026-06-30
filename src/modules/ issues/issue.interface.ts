export type IssueStatus = "open" | "in_progress" | "resolved";
export type IssueType = "bug" | "feature_request";

export interface IIssue {
  id?: string | number;
  title: string;
  description: string;
  type: IssueType | string;
  status: IssueStatus | string;
  reporter_id?: string | number;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface IUpdateIssue {
  title?: string;
  description?: string;
  type?: string;
  status?: string;
}


