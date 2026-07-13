// Chat is now handled directly via Firebase Firestore from the frontend.
// This file is intentionally left as a no-op stub so Vercel doesn't error
// if the old endpoint is ever called.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function handler(_req: any, res: any) {
  res.status(410).json({ error: 'Chat API removed — using Firebase Firestore directly.' });
}
