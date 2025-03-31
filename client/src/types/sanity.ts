export interface SanityReference {
  _ref: string;
  _type: string;
}

export interface SanityAsset {
  _type: 'reference';
  _ref: string;
}

export interface SanityDocument {
  _id: string;
  _type: string;
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
}

export interface QueryResult<T> extends SanityDocument {
  data: T;
}
