import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuthActions } from '@convex-dev/auth/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function SignupPage() {
  const navigate = useNavigate()
  const { signIn } = useAuthActions()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const passwordMismatch = passwordConfirm.length > 0 && password !== passwordConfirm

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordMismatch) return
    setError('')
    setLoading(true)

    try {
      await signIn('password', { email, password, name, flow: 'signUp' })
      alert('회원가입이 완료되었습니다.')
      navigate('/')
    } catch {
      setError('회원가입에 실패했습니다. 이미 존재하는 이메일일 수 있습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* 좌측 브랜딩 영역 */}
      <div
        className="hidden lg:flex lg:w-[480px] flex-col justify-between p-10"
        style={{ backgroundColor: 'hsl(215, 28%, 17%)' }}
      >
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600/20 ring-1 ring-teal-500/30">
              <GraduationCap className="h-5 w-5 text-teal-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">강사 관리</h1>
              <p className="text-xs text-white/40">Admin CRM</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white leading-snug">
            팀과 함께<br />
            강사를 관리하세요.
          </h2>
          <p className="mt-3 text-sm text-white/50 leading-relaxed">
            계정을 생성하고 강사 관리 시스템에<br />
            접속하여 업무를 시작하세요.
          </p>
        </div>

        <p className="text-xs text-white/25">&copy; 2026 강사 관리 CRM. All rights reserved.</p>
      </div>

      {/* 우측 회원가입 폼 */}
      <div className="flex flex-1 items-center justify-center bg-white px-6">
        <div className="w-full max-w-sm">
          {/* 모바일 로고 */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50">
              <GraduationCap className="h-5 w-5 text-teal-600" />
            </div>
            <span className="text-lg font-semibold text-slate-900">강사 관리 CRM</span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900">회원가입</h2>
          <p className="mt-1.5 text-sm text-slate-500">
            관리자 계정을 생성합니다.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                이름
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 rounded-xl border-gray-200 text-sm placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-teal-500/40 focus-visible:border-teal-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email" className="text-sm font-medium text-slate-700">
                이메일
              </Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 rounded-xl border-gray-200 text-sm placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-teal-500/40 focus-visible:border-teal-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password" className="text-sm font-medium text-slate-700">
                비밀번호
              </Label>
              <div className="relative">
                <Input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="8자 이상 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 rounded-xl border-gray-200 pr-10 text-sm placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-teal-500/40 focus-visible:border-teal-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password-confirm" className="text-sm font-medium text-slate-700">
                비밀번호 확인
              </Label>
              <Input
                id="password-confirm"
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className={`h-10 rounded-xl text-sm placeholder:text-slate-400 focus-visible:ring-1 ${
                  passwordMismatch
                    ? 'border-red-300 focus-visible:ring-red-500/40 focus-visible:border-red-400'
                    : 'border-gray-200 focus-visible:ring-teal-500/40 focus-visible:border-teal-400'
                }`}
              />
              {passwordMismatch && (
                <p className="text-xs text-red-500">비밀번호가 일치하지 않습니다.</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading || !name || !email || !password || !passwordConfirm || passwordMismatch}
              className="h-10 w-full rounded-xl bg-teal-600 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700 active:bg-teal-800 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                '회원가입'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-700">
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
