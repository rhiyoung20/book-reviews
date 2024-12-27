interface VerificationData {
    code: string;
    expiresAt: Date;
  }
  
  const verificationStore = new Map<string, VerificationData>();
  
  export const storeVerificationCode = (email: string, code: string) => {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10분 후 만료
    verificationStore.set(email, { code, expiresAt });
  };
  
  export const verifyCode = (email: string, code: string) => {
    const data = verificationStore.get(email);
    if (!data) return false;
    if (data.expiresAt < new Date()) {
      verificationStore.delete(email);
      return false;
    }
    return data.code === code;
  };