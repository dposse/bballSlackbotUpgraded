/////////////////////////////////////////////////////////////
// Types and Interfaces
export interface IMLBApi {
  get(date: Date): Promise<any[]>;
}

export type GameResult = {
  targetTeamCode: TeamKey;
  otherTeamCode: TeamKey;
  status: 'won' | 'lost' | 'draw';
  scoreDifference: number;
};

export type TeamKey =
  | 'ana'
  | 'ari'
  | 'atl'
  | 'bal'
  | 'bos'
  | 'cha'
  | 'chn'
  | 'cin'
  | 'cle'
  | 'col'
  | 'det'
  | 'hou'
  | 'kca'
  | 'lan'
  | 'mia'
  | 'mil'
  | 'min'
  | 'nya'
  | 'nyn'
  | 'oak'
  | 'phi'
  | 'pit'
  | 'sdn'
  | 'sea'
  | 'sfn'
  | 'sln'
  | 'tba'
  | 'tex'
  | 'tor'
  | 'was';
