export interface HashMap<T> {
  [key: string]: T;
}

export interface Upload {
  createReadStream(): ReadableStream;
  filename: string
  mimetype: string
  id: string
  path: string
}

export interface StoredFile {
  id: string
  path: string
}