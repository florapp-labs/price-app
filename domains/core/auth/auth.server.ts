'use server'

import { getAuth } from 'firebase-admin/auth';
import { firebaseApp } from '../firebase/firebase.client';

const auth = async () => getAuth(await firebaseApp());

export { auth };
