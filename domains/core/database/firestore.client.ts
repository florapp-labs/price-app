'use server';

import { getFirestore } from 'firebase-admin/firestore';
import { firebaseApp } from '../firebase/firebase.client';

export const Database = async () => getFirestore(await firebaseApp());