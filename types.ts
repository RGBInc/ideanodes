export interface IdeaNode {
  id: string;
  title: string;
  content: string;
  type: 'initial' | 'expansion' | 'blueprint' | 'user';
  createdAt: number;
}

export interface GenerationConfig {
  contextNodes: IdeaNode[];
  newTopic?: string;
  mode: 'continue' | 'remix';
}

export enum NodeActionType {
  ADD = 'ADD',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  SET_ALL = 'SET_ALL'
}