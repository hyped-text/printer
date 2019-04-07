import { graphqlUploadKoa } from 'graphql-upload';

export default () => graphqlUploadKoa({ maxFileSize: 10000000, maxFiles: 10 });
