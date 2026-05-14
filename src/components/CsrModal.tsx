import { useEffect, useState } from 'react'
import type { CsrFormInput, CsrSubmission, RuleInput } from '../types'
import { submitCsr } from '../lib/csr'

interface Props {
  open: boolean
  onClose: () => void
  rulesForRequest: RuleInput[]   // BLOCKED/NO_ROUTE 룰들
}

function todayIso(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const blankForm: CsrFormInput = {
  requester_name: '',
  employee_id: '',
  department: '',
  reason: '',
  due_date: todayIso(),
  duration: 'permanent',
  impact: 'normal',
}

export function CsrModal({ open, onClose, rulesForRequest }: Props) {
  const [form, setForm] = useState<CsrFormInput>(blankForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CsrSubmission | null>(null)

  // 모달 닫을 때 상태 초기화
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setForm(blankForm)
        setSubmitting(false)
        setError(null)
        setResult(null)
      }, 200)
    }
  }, [open])

  if (!open) return null

  const set = <K extends keyof CsrFormInput>(k: K, v: CsrFormInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const canSubmit =
    form.requester_name.trim() &&
    form.employee_id.trim() &&
    form.department.trim() &&
    form.reason.trim() &&
    form.due_date &&
    (form.duration === 'permanent' || (form.end_date && form.end_date >= form.due_date))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const r = await submitCsr(form, rulesForRequest)
      setResult(r)
    } catch (err) {
      setError(String((err as Error)?.message ?? err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop p-4" onClick={onClose}>
      <div
        className="glass relative w-full max-w-2xl rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {!result ? (
          <form onSubmit={onSubmit}>
            <div className="px-6 py-5 border-b border-zinc-200 dark:border-white/[0.06] flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-600 dark:text-cyan-400 mb-1">
                  02 · CSR Request
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">CSR 신청</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {rulesForRequest.length}건의 룰에 대해 통합 CSR을 생성합니다.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="요청자 이름" required>
                  <input
                    type="text"
                    value={form.requester_name}
                    onChange={(e) => set('requester_name', e.target.value)}
                    placeholder="홍길동"
                    className="input-themed w-full px-3 py-2 text-sm rounded-md"
                  />
                </Field>
                <Field label="사번" required>
                  <input
                    type="text"
                    value={form.employee_id}
                    onChange={(e) => set('employee_id', e.target.value)}
                    placeholder="E12345"
                    className="input-themed mono w-full px-3 py-2 text-sm rounded-md"
                  />
                </Field>
                <Field label="부서" required>
                  <input
                    type="text"
                    value={form.department}
                    onChange={(e) => set('department', e.target.value)}
                    placeholder="정보보안실"
                    className="input-themed w-full px-3 py-2 text-sm rounded-md"
                  />
                </Field>
              </div>

              <Field label="요청 사유" required>
                <textarea
                  rows={3}
                  value={form.reason}
                  onChange={(e) => set('reason', e.target.value)}
                  placeholder="ERP 신규 모듈 운영 환경 배포를 위해..."
                  className="input-themed w-full px-3 py-2 text-sm rounded-md resize-none"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="희망 완료일" required>
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={(e) => set('due_date', e.target.value)}
                    className="input-themed mono w-full px-3 py-2 text-sm rounded-md"
                  />
                </Field>
                <Field label="사용 기간" required>
                  <div className="flex gap-2 pt-1">
                    <Radio name="duration" value="permanent" current={form.duration} onChange={(v) => set('duration', v)}>영구</Radio>
                    <Radio name="duration" value="temporary" current={form.duration} onChange={(v) => set('duration', v)}>임시</Radio>
                  </div>
                </Field>
              </div>

              {form.duration === 'temporary' && (
                <Field label="종료일" required>
                  <input
                    type="date"
                    value={form.end_date ?? ''}
                    min={form.due_date}
                    onChange={(e) => set('end_date', e.target.value)}
                    className="input-themed mono w-48 px-3 py-2 text-sm rounded-md"
                  />
                </Field>
              )}

              <Field label="업무 영향도" required>
                <div className="flex gap-2">
                  <Radio name="impact" value="urgent" current={form.impact} onChange={(v) => set('impact', v)}>긴급</Radio>
                  <Radio name="impact" value="normal" current={form.impact} onChange={(v) => set('impact', v)}>보통</Radio>
                  <Radio name="impact" value="low"    current={form.impact} onChange={(v) => set('impact', v)}>낮음</Radio>
                </div>
              </Field>

              {error && (
                <div className="px-3 py-2 rounded bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-700 dark:text-rose-300">
                  {error}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-zinc-200 dark:border-white/[0.06] bg-zinc-50/50 dark:bg-black/20 flex items-center justify-between">
              <button type="button" onClick={onClose} className="btn-secondary px-3 py-1.5 text-xs font-medium rounded-md">
                취소
              </button>
              <button type="submit" disabled={!canSubmit || submitting} className="btn-primary px-6 py-2 text-xs rounded-md tracking-wide">
                {submitting ? '신청 중…' : '요청하기 →'}
              </button>
            </div>
          </form>
        ) : (
          <SuccessView result={result} onClose={onClose} />
        )}
      </div>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </span>
      {children}
    </label>
  )
}

function Radio<T extends string>({
  name, value, current, onChange, children,
}: { name: string; value: T; current: T; onChange: (v: T) => void; children: React.ReactNode }) {
  const active = current === value
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={
        'px-3 py-1.5 text-xs font-medium rounded-md border transition ' +
        (active
          ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white'
          : 'bg-white dark:bg-white/[0.04] text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-white/[0.10] hover:border-zinc-400 dark:hover:border-white/[0.20]')
      }
      aria-pressed={active}
      data-name={name}
    >
      {children}
    </button>
  )
}

function SuccessView({ result, onClose }: { result: CsrSubmission; onClose: () => void }) {
  return (
    <div>
      <div className="px-6 py-10 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 flex items-center justify-center border-2 border-emerald-500/30">
          <span className="text-2xl">✓</span>
        </div>
        <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">CSR 접수 완료</h3>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          접수 번호로 진행 상황을 추적할 수 있습니다.
        </p>
        <div className="mt-5 inline-block px-4 py-2 rounded-md bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/[0.10]">
          <span className="mono text-lg font-semibold text-cyan-700 dark:text-cyan-300">{result.id}</span>
        </div>
        <div className="mt-6 text-left text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto space-y-1">
          <div className="flex justify-between"><span>요청자</span><span className="text-zinc-800 dark:text-zinc-200">{result.requester_name} ({result.employee_id})</span></div>
          <div className="flex justify-between"><span>부서</span><span className="text-zinc-800 dark:text-zinc-200">{result.department}</span></div>
          <div className="flex justify-between"><span>희망 완료일</span><span className="text-zinc-800 dark:text-zinc-200 mono">{result.due_date}</span></div>
          <div className="flex justify-between"><span>사용 기간</span><span className="text-zinc-800 dark:text-zinc-200">{result.duration === 'permanent' ? '영구' : `임시 (~ ${result.end_date})`}</span></div>
          <div className="flex justify-between"><span>업무 영향도</span><span className="text-zinc-800 dark:text-zinc-200">{({ urgent: '긴급', normal: '보통', low: '낮음' } as const)[result.impact]}</span></div>
          <div className="flex justify-between"><span>포함 룰</span><span className="text-zinc-800 dark:text-zinc-200">{result.rules.length}건</span></div>
        </div>
      </div>
      <div className="px-6 py-4 border-t border-zinc-200 dark:border-white/[0.06] bg-zinc-50/50 dark:bg-black/20 flex justify-end">
        <button onClick={onClose} className="btn-primary px-6 py-2 text-xs rounded-md tracking-wide">
          닫기
        </button>
      </div>
    </div>
  )
}
