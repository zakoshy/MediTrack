'use server';

import { suggestDiagnosis } from '@/ai/flows/ai-suggested-diagnosis';
import { medicationSearch } from '@/ai/flows/ai-medication-search';
import { z } from 'zod';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { UserSchema } from '@/models/User';

const diagnosisSchema = z.object({
  symptoms: z.string(),
  vitals: z.string(),
  medicalHistory: z.string().optional(),
});

export async function getSuggestedDiagnosis(data: {
  symptoms: string;
  vitals: string;
  medicalHistory?: string;
}) {
  const parsedData = diagnosisSchema.safeParse(data);
  if (!parsedData.success) {
    return { error: 'Invalid input.' };
  }

  try {
    const result = await suggestDiagnosis(parsedData.data);
    return { suggestedDiagnoses: result.suggestedDiagnoses };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to get AI diagnosis suggestion.' };
  }
}

const medicationSchema = z.object({
  medicationName: z.string().min(1, 'Medication name cannot be empty.'),
});

export async function searchMedication(data: { medicationName: string }) {
  const parsedData = medicationSchema.safeParse(data);
  if (!parsedData.success) {
    return { error: 'Invalid input.' };
  }

  try {
    const result = await medicationSearch(parsedData.data);
    return { searchResults: result.searchResults };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to search for medication.' };
  }
}


const CreateUserSchema = UserSchema;

export async function createUser(formData: z.infer<typeof CreateUserSchema>) {
  try {
    const validation = CreateUserSchema.safeParse(formData);
    if (!validation.success) {
      return { error: 'Invalid user data.' };
    }
    
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection('users');

    const existingUser = await usersCollection.findOne({ email: formData.email });
    if (existingUser) {
      return { error: 'A user with this email already exists.' };
    }

    const hashedPassword = await bcrypt.hash(formData.password, 10);

    const result = await usersCollection.insertOne({
      ...formData,
      password: hashedPassword,
    });
    
    return { success: true, userId: result.insertedId };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to create user.' };
  }
}

export async function getUsers() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const users = await db.collection('users').find({}, { projection: { password: 0 } }).toArray();
    return { users: JSON.parse(JSON.stringify(users)) }; // Serialize to pass through server action boundary
  } catch (e) {
    console.error(e);
    return { error: 'Failed to fetch users.' };
  }
}

const ChangePasswordSchema = z.object({
  userId: z.string(),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export async function changePassword(formData: z.infer<typeof ChangePasswordSchema>) {
   try {
    const validation = ChangePasswordSchema.safeParse(formData);
    if (!validation.success) {
      return { error: 'Invalid data.' };
    }
    
    const { userId, password } = formData;
    const client = await clientPromise;
    const db = client.db();
    const { ObjectId } = await import('mongodb');

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { password: hashedPassword } }
    );
    
    if (result.modifiedCount === 0) {
       return { error: 'User not found or password is the same.' };
    }

    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to change password.' };
  }
}

const DeleteUserSchema = z.object({
  userId: z.string(),
});

export async function deleteUser(formData: z.infer<typeof DeleteUserSchema>) {
  try {
    const validation = DeleteUserSchema.safeParse(formData);
    if (!validation.success) {
      return { error: 'Invalid data.' };
    }

    const { userId } = formData;
    const client = await clientPromise;
    const db = client.db();
    const { ObjectId } = await import('mongodb');

    const userToDelete = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (userToDelete && userToDelete.role === 'Admin') {
      return { error: 'Cannot delete an admin account.' };
    }

    const result = await db.collection('users').deleteOne({ _id: new ObjectId(userId) });

    if (result.deletedCount === 0) {
      return { error: 'User not found.' };
    }

    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to delete user.' };
  }
}
