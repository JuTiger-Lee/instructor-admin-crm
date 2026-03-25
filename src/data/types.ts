/** 자격증 정보 */
export interface Certificate {
  id: string
  name: string
  issuer: string
  date: string
}

/** 학력 정보 */
export interface Education {
  id: string
  school: string
  major: string
  graduationYear: string
}

/** 계좌 정보 */
export interface BankAccount {
  bank: string
  accountNumber: string
}
