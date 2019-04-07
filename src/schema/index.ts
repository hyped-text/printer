import { readFileSync } from 'fs';
import { join } from 'path';
import { makeExecutableSchema } from 'graphql-tools';
import resolvers from '../resolvers';

export const typeDefs = readFileSync(join(__dirname, 'schema.graphql'), { encoding: 'utf-8'});

export const schema = makeExecutableSchema({ typeDefs, resolvers });
