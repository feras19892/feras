export interface SiteInfo {
  title: string;
  language: string;
  description: string;
}

export interface HomeCard {
  id: string;
  icon: string;
  title: string;
  desc: string;
  stats: string;
  branchId: string;
}

export interface PhysicsExperiment {
  id: string;
  title: string;
  icon: string;
  description: string;
  tools: string[];
  variables: string[];
  sourcePath?: string;
}

export interface PhysicsBranch {
  id: string;
  title: string;
  description: string;
  icon: string;
  stats: string;
  sourcePath?: string;
  experiments: PhysicsExperiment[];
}

export interface ExperimentDetails extends PhysicsExperiment {
  branchId: string;
  branchTitle: string;
}
