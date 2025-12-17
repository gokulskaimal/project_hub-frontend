export interface Project{
    id : string,
    orgId : string,
    name : string,
    description : string,
    status : "ACTIVE" | "ARCHIVED" | "COMPLETED",
    startDate : string,
    endDate : string,
    createdAt : string,
}



export interface Task{
    id : string,
    projectId : string,
    title : string,
    description : string,
    status : "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE",
    priority : "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    assignedTo? : string,
    dueDate?: string,

}