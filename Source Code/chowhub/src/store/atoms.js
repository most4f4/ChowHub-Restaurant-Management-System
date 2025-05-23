// src/store/atoms.js
import { atomWithStorage } from 'jotai/utils';

export const tokenAtom = atomWithStorage('token', null);
export const userAtom  = atomWithStorage('user',  null);

