'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

const Const_adminSessionStorageKey = 'somente_alunos_admin_session_v1'
const Const_getAdminConteudoQueryExample = `{
  "limit": 50,
  "page": 1,
  "content_uuid": "11111111-1111-1111-1111-111111111111",
  "content_uuid_array": "11111111-1111-1111-1111-111111111111,22222222-2222-2222-2222-222222222222",
  "student_uuid_content": "33333333-3333-3333-3333-333333333333",
  "student_uuid_content_array": "33333333-3333-3333-3333-333333333333,44444444-4444-4444-4444-444444444444",
  "college_uuid_content": "55555555-5555-5555-5555-555555555555",
  "college_uuid_content_array": "55555555-5555-5555-5555-555555555555,66666666-6666-6666-6666-666666666666",
  "course_uuid_content": "77777777-7777-7777-7777-777777777777",
  "course_uuid_content_array": "77777777-7777-7777-7777-777777777777,88888888-8888-8888-8888-888888888888",
  "name_content": "Anatomia",
  "name_content_like": "anato",
  "q": "material",
  "class_content": "A1",
  "verified_content": 1,
  "preview_file_uuid_content": "99999999-9999-9999-9999-999999999999",
  "full_file_uuid_content": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  "has_preview_file_content": true,
  "has_full_file_content": true,
  "min_current_price_content": 0,
  "max_current_price_content": 500,
  "min_old_price_content": 0,
  "max_old_price_content": 1000,
  "content_created_from": "2026-01-01T00:00:00.000Z",
  "content_created_to": "2026-12-31T23:59:59.999Z",
  "content_update_from": "2026-01-01T00:00:00.000Z",
  "content_update_to": "2026-12-31T23:59:59.999Z",
  "prevision_content_from": "2026-01-01T00:00:00.000Z",
  "prevision_content_to": "2026-12-31T23:59:59.999Z",
  "order_by": "content_update",
  "order_direction": "desc"
}`

type Type_httpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE'

type Type_selectOption = {
	value: string;
	label: string;
}

type Type_adminSessionStorage = {
	admin?: {
		admin_uuid?: string;
		name_admin?: string;
		email_admin?: string;
	};
	loggedAt?: string;
}

type Type_metricStudent = {
	student_uuid: string;
	invitation_code_student?: string | null;
	ra_student?: string | null;
	cpf_student?: string | null;
	college_uuid_student?: string | null;
	course_uuid_student?: string | null;
	class_student?: string | null;
}

type Type_metricCollege = {
	college_uuid: string;
	name_college: string;
	svg_college?: string | null;
}

type Type_metricCourse = {
	course_uuid: string;
	name_course: string;
	svg_course?: string | null;
	college_uuid_course: string;
}

type Type_metricContent = {
	content_uuid: string;
	name_content: string;
	student_uuid_content: string;
	college_uuid_content: string;
	course_uuid_content: string;
	class_content?: string | null;
	current_price_content?: number;
	old_price_content?: number | null;
	preview_file_uuid_content?: string | null;
	full_file_uuid_content?: string | null;
	verified_content?: 0 | 1;
}

type Type_metricSaleHistory = {
	sale_history_uuid: string;
	student_uuid_seller_sale_history?: string | null;
	student_uuid_buyer_sale_history: string;
	content_uuid_sale_history: string;
	status_sale_history?: string;
	paid_to_seller_sale_history?: string | null;
}

type Type_metricAdmin = {
	admin_uuid: string;
	name_admin?: string;
	email_admin?: string;
}

type Type_metricDenuncia = {
	denuncia_uuid: string;
	denuncia_created: string;
	denuncia_update?: string;
	student_uuid_denuncia: string;
	content_uuid_denuncia: string;
	reason_array_denuncia?: string | string[];
	extra_information_denuncia?: string | null;
	status_denuncia?: string;
	admin_uuid_review_denuncia?: string | null;
	review_note_denuncia?: string | null;
	reviewed_at_denuncia?: string | null;
}

type Type_adminDenunciaItem = {
	denuncia_uuid: string;
	denuncia_created: string;
	denuncia_update: string;
	student_uuid_denuncia: string;
	content_uuid_denuncia: string;
	reason_array_denuncia: string[];
	extra_information_denuncia: string | null;
	status_denuncia: string;
	admin_uuid_review_denuncia: string | null;
	review_note_denuncia: string | null;
	reviewed_at_denuncia: string | null;
	content_name_denuncia: string | null;
	content_owner_student_uuid_denuncia: string | null;
	reporter_ra_student_denuncia: string | null;
	reporter_cpf_student_denuncia: string | null;
}

type Type_getAdminDenunciaResponse = {
	denunciaArray?: Type_adminDenunciaItem[];
	pagination?: {
		limit?: number;
		page?: number;
		totalCount?: number;
		totalPages?: number;
		hasNextPage?: boolean;
		hasPreviousPage?: boolean;
	};
	filter?: {
		orderBy?: "denuncia_created" | "denuncia_update";
		orderDirection?: "asc" | "desc";
	};
}

type Type_metricResponse = {
	metric?: {
		studentCount?: number;
		collegeCount?: number;
		courseCount?: number;
		contentCount?: number;
		denunciaCount?: number;
		saleHistoryCount?: number;
		saleHistoryCompletedCount?: number;
		pendingToSellerAmount?: number;
		paidToSellerAmount?: number;
	};
	studentArray?: Type_metricStudent[];
	collegeArray?: Type_metricCollege[];
	courseArray?: Type_metricCourse[];
	contentArray?: Type_metricContent[];
	denunciaArray?: Type_metricDenuncia[];
	saleHistoryArray?: Type_metricSaleHistory[];
	adminArray?: Type_metricAdmin[];
}

type Type_requestLog = {
	id: string;
	createdAt: string;
	method: Type_httpMethod;
	path: string;
	url: string;
	ok: boolean;
	status: number | null;
	durationMs: number;
	requestPayload: unknown;
	responsePayload: unknown;
	responseHeaders: Record<string, string>;
}

type Type_requestQueryValue = string | number | boolean | null | undefined

type Type_requestRunConfig = {
	method: Type_httpMethod;
	path: string;
	query?: Record<string, Type_requestQueryValue>;
	jsonBody?: Record<string, unknown>;
	formDataBody?: FormData;
}

type Type_studentOrAdminCollegeResponse = {
	collegeArray?: Type_metricCollege[];
}

type Type_studentOrAdminCourseResponse = {
	courseArray?: Type_metricCourse[];
}

type Type_createStudentFormState = {
	ra_student: string;
	cpf_student: string;
	college_uuid_student: string;
	course_uuid_student: string;
	class_student: string;
}

type Type_collegeFormState = {
	college_uuid: string;
	name_college: string;
	svg_college: string;
}

type Type_courseFormState = {
	course_uuid: string;
	name_course: string;
	svg_course: string;
	college_uuid_course: string;
}

type Type_createContentFormState = {
	content_uuid: string;
	name_content: string;
	student_uuid_content: string;
	old_price_content: string;
	current_price_content: string;
	preview_file_uuid_content: string;
	full_file_uuid_content: string;
	college_uuid_content: string;
	course_uuid_content: string;
	class_content: string;
	prevision_content: string;
	verified_content: '' | '0' | '1';
	preview_file_content: File | null;
	full_file_content: File | null;
}

type Type_patchContentFormState = {
	content_uuid: string;
	content_uuid_new: string;
	name_content: string;
	student_uuid_content: string;
	old_price_content: string;
	current_price_content: string;
	preview_file_uuid_content: string;
	full_file_uuid_content: string;
	college_uuid_content: string;
	course_uuid_content: string;
	class_content: string;
	prevision_content: string;
	verified_content: '' | '0' | '1';
}

type Type_contentFileFormState = {
	content_uuid: string;
	file_role: 'preview' | 'full';
	file: File | null;
}

type Type_saleHistoryCreateFormState = {
	sale_history_uuid: string;
	student_uuid_seller_sale_history: string;
	student_uuid_buyer_sale_history: string;
	content_uuid_sale_history: string;
	status_sale_history: string;
	paid_to_seller_sale_history: string;
	information_content_sale_history: string;
}

type Type_saleHistoryPatchFormState = {
	sale_history_uuid: string;
	student_uuid_seller_sale_history: string;
	student_uuid_buyer_sale_history: string;
	content_uuid_sale_history: string;
	status_sale_history: string;
	paid_to_seller_sale_history: string;
	information_content_sale_history: string;
}

type Type_webhookFormState = Record<string, never>

function Function_getTrimmedStringOrUndefined(Parameter_value: string): string | undefined {
	const Const_trimmed = Parameter_value.trim()
	return Const_trimmed.length > 0 ? Const_trimmed : undefined
}

function Function_getTrimmedStringOrNullOrUndefined(Parameter_value: string): string | null | undefined {
	const Const_trimmed = Parameter_value.trim()
	if (Const_trimmed.length <= 0) {
		return undefined
	}
	if (Const_trimmed.toLowerCase() === 'null') {
		return null
	}
	return Const_trimmed
}

function Function_getNumberOrUndefined(Parameter_value: string): number | undefined {
	const Const_trimmed = Parameter_value.trim()
	if (Const_trimmed.length <= 0) {
		return undefined
	}
	const Const_number = Number(Const_trimmed)
	if (!Number.isFinite(Const_number)) {
		return undefined
	}
	return Const_number
}

function Function_getNumberOrNullOrUndefined(Parameter_value: string): number | null | undefined {
	const Const_trimmed = Parameter_value.trim()
	if (Const_trimmed.length <= 0) {
		return undefined
	}
	if (Const_trimmed.toLowerCase() === 'null') {
		return null
	}
	const Const_number = Number(Const_trimmed)
	if (!Number.isFinite(Const_number)) {
		return undefined
	}
	return Const_number
}

function Function_getObjectWithoutUndefined(Parameter_object: Record<string, unknown>): Record<string, unknown> {
	const Const_entries = Object.entries(Parameter_object)
	const Const_filtered = Const_entries.filter(([, Parameter_value]) => Parameter_value !== undefined)
	return Object.fromEntries(Const_filtered)
}

function Function_tryParseJsonOrString(Parameter_text: string): unknown {
	const Const_trimmed = Parameter_text.trim()
	if (Const_trimmed.length <= 0) {
		return undefined
	}
	if (Const_trimmed.toLowerCase() === 'null') {
		return null
	}

	try {
		return JSON.parse(Const_trimmed) as unknown
	}
	catch {
		return Const_trimmed
	}
}

function Function_getFormDataPreviewObject(Parameter_formData: FormData): Record<string, unknown> {
	const Const_preview: Record<string, unknown> = {}

	for (const [Const_key, Const_value] of Array.from(Parameter_formData.entries())) {
		if (Const_value instanceof File) {
			Const_preview[Const_key] = {
				fileName: Const_value.name,
				fileType: Const_value.type,
				fileSize: Const_value.size
			}
			continue
		}

		Const_preview[Const_key] = Const_value
	}

	return Const_preview
}

async function Function_getResponsePayload(Parameter_response: Response): Promise<unknown> {
	const Const_text = await Parameter_response.text()
	if (!Const_text) {
		return null
	}

	try {
		return JSON.parse(Const_text) as unknown
	}
	catch {
		return Const_text
	}
}

function Function_getDateTimeLabel(Parameter_isoString: string): string {
	try {
		return new Date(Parameter_isoString).toLocaleString('pt-BR')
	}
	catch {
		return Parameter_isoString
	}
}

function Function_getNowIsoString(): string {
	return new Date().toISOString()
}

function Function_readAdminSessionStorage(): Type_adminSessionStorage | null {
	if (typeof localStorage === 'undefined') {
		return null
	}

	try {
		const Const_raw = localStorage.getItem(Const_adminSessionStorageKey)
		if (!Const_raw) {
			return null
		}
		const Const_sessionUnknown = JSON.parse(Const_raw) as Type_adminSessionStorage
		return Const_sessionUnknown
	}
	catch {
		return null
	}
}

function Function_clearAdminArtifacts(): void {
	if (typeof localStorage !== 'undefined') {
		localStorage.removeItem(Const_adminSessionStorageKey)
	}

	if (typeof document !== 'undefined') {
		const Const_cookiePrefix = process.env.NEXT_PUBLIC_Env_cookiePrefix
		const Const_cookieDomain = process.env.NEXT_PUBLIC_Env_cookieDomainApi
		for (const Const_cookieName of [`${Const_cookiePrefix}_admin_jwt`, `${Const_cookiePrefix}_jwt`, `${Const_cookiePrefix}_student_jwt`]) {
			document.cookie = `${Const_cookieName}=; Max-Age=0; path=/;`
			if (Const_cookieDomain) {
				document.cookie = `${Const_cookieName}=; Max-Age=0; path=/; domain=${Const_cookieDomain};`
			}
		}
	}
}

function Component_FormSection(Parameter_props: { title: string; subtitle?: string; children: React.ReactNode }): JSX.Element {
	return (
		<section className="rounded-xl border border-slate-700/80 bg-slate-900/70 p-4 md:p-5">
			<h2 className="text-lg font-semibold">{Parameter_props.title}</h2>
			{Parameter_props.subtitle ? (
				<p className="mt-1 text-xs text-slate-400">{Parameter_props.subtitle}</p>
			) : null}
			<div className="mt-4 grid gap-3">{Parameter_props.children}</div>
		</section>
	)
}

function Component_RegionSection(Parameter_props: { title: string; subtitle?: string; children: React.ReactNode }): JSX.Element {
	return (
		<section className="rounded-2xl border border-slate-600/80 bg-slate-900/70 p-4 md:p-5">
			<div className="flex items-center gap-3">
				<div className="h-3 w-3 rounded-full bg-sky-400/90" />
				<h2 className="text-xl font-semibold tracking-tight">{Parameter_props.title}</h2>
			</div>
			{Parameter_props.subtitle ? (
				<p className="mt-2 text-xs text-slate-400">{Parameter_props.subtitle}</p>
			) : null}
			<div className="mt-4 grid gap-4">{Parameter_props.children}</div>
		</section>
	)
}

function Component_Field(Parameter_props: {
	label: string;
	value: string;
	onChange: (Parameter_value: string) => void;
	placeholder?: string;
	type?: string;
	listId?: string;
	required?: boolean;
}): JSX.Element {
	return (
		<label className="grid gap-1">
			<span className="text-xs font-medium text-slate-300">{Parameter_props.label}</span>
			<input
				type={Parameter_props.type || 'text'}
				required={Parameter_props.required}
				value={Parameter_props.value}
				onChange={(Parameter_event) => Parameter_props.onChange(Parameter_event.target.value)}
				list={Parameter_props.listId}
				placeholder={Parameter_props.placeholder}
				className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-400"
			/>
		</label>
	)
}

function Component_SelectOrTypeField(Parameter_props: {
	label: string;
	value: string;
	onChange: (Parameter_value: string) => void;
	placeholder?: string;
	options: Type_selectOption[];
	listId: string;
}): JSX.Element {
	const Const_selectValue = Parameter_props.options.some((Parameter_option) => Parameter_option.value === Parameter_props.value)
		? Parameter_props.value
		: ''

	return (
		<div className="grid gap-1">
			<span className="text-xs font-medium text-slate-300">{Parameter_props.label}</span>
			<div className="grid gap-2 md:grid-cols-[220px_1fr]">
				<select
					value={Const_selectValue}
					onChange={(Parameter_event) => Parameter_props.onChange(Parameter_event.target.value)}
					className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-400"
				>
					<option value="">Selecionar</option>
					{Parameter_props.options.map((Parameter_option) => (
						<option key={`${Parameter_props.listId}-${Parameter_option.value}`} value={Parameter_option.value}>
							{Parameter_option.label}
						</option>
					))}
				</select>

				<input
					type="text"
					value={Parameter_props.value}
					list={Parameter_props.listId}
					onChange={(Parameter_event) => Parameter_props.onChange(Parameter_event.target.value)}
					placeholder={Parameter_props.placeholder}
					className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-400"
				/>

				<datalist id={Parameter_props.listId}>
					{Parameter_props.options.map((Parameter_option) => (
						<option key={Parameter_option.value} value={Parameter_option.value} label={Parameter_option.label} />
					))}
				</datalist>
			</div>
		</div>
	)
}

export default function Page_Admin(): JSX.Element {
	const Const_router = useRouter()
	const Const_backendBaseUrl = process.env.NEXT_PUBLIC_Env_urlApiBackend || ''

	const [isRequestLogArray, setRequestLogArray] = useState<Type_requestLog[]>([])
	const [isCurrentRequestLogId, setCurrentRequestLogId] = useState<string | null>(null)
	const [isRunningRequestKey, setRunningRequestKey] = useState('')
	const [isAdminSessionStorage, setAdminSessionStorage] = useState<Type_adminSessionStorage | null>(null)
	const [isMetricResponse, setMetricResponse] = useState<Type_metricResponse | null>(null)
	const [isAdminDenunciaResponse, setAdminDenunciaResponse] = useState<Type_getAdminDenunciaResponse | null>(null)
	const [isStudentOrAdminCollegeArray, setStudentOrAdminCollegeArray] = useState<Type_metricCollege[]>([])
	const [isStudentOrAdminCourseArray, setStudentOrAdminCourseArray] = useState<Type_metricCourse[]>([])
	const [isGetAdminConteudoQueryJson, setGetAdminConteudoQueryJson] = useState(Const_getAdminConteudoQueryExample)
	const [isGetCourseByCollegeUuid, setGetCourseByCollegeUuid] = useState('')
	const [isUtilityUuid, setUtilityUuid] = useState('')
	const [isUtilityNowIso, setUtilityNowIso] = useState('')

	const [isCreateStudentForm, setCreateStudentForm] = useState<Type_createStudentFormState>({
		ra_student: '',
		cpf_student: '',
		college_uuid_student: '',
		course_uuid_student: '',
		class_student: ''
	})

	const [isCreateCollegeForm, setCreateCollegeForm] = useState<Type_collegeFormState>({
		college_uuid: '',
		name_college: '',
		svg_college: ''
	})

	const [isPatchCollegeForm, setPatchCollegeForm] = useState<Type_collegeFormState>({
		college_uuid: '',
		name_college: '',
		svg_college: ''
	})

	const [isDeleteCollegeUuid, setDeleteCollegeUuid] = useState('')

	const [isCreateCourseForm, setCreateCourseForm] = useState<Type_courseFormState>({
		course_uuid: '',
		name_course: '',
		svg_course: '',
		college_uuid_course: ''
	})

	const [isPatchCourseForm, setPatchCourseForm] = useState<Type_courseFormState>({
		course_uuid: '',
		name_course: '',
		svg_course: '',
		college_uuid_course: ''
	})

	const [isDeleteCourseUuid, setDeleteCourseUuid] = useState('')

	const [isCreateContentForm, setCreateContentForm] = useState<Type_createContentFormState>({
		content_uuid: '',
		name_content: '',
		student_uuid_content: '',
		old_price_content: '',
		current_price_content: '',
		preview_file_uuid_content: '',
		full_file_uuid_content: '',
		college_uuid_content: '',
		course_uuid_content: '',
		class_content: '',
		prevision_content: '',
		verified_content: '',
		preview_file_content: null,
		full_file_content: null
	})

	const [isUploadContentFileForm, setUploadContentFileForm] = useState<Type_contentFileFormState>({
		content_uuid: '',
		file_role: 'preview',
		file: null
	})

	const [isPatchContentForm, setPatchContentForm] = useState<Type_patchContentFormState>({
		content_uuid: '',
		content_uuid_new: '',
		name_content: '',
		student_uuid_content: '',
		old_price_content: '',
		current_price_content: '',
		preview_file_uuid_content: '',
		full_file_uuid_content: '',
		college_uuid_content: '',
		course_uuid_content: '',
		class_content: '',
		prevision_content: '',
		verified_content: ''
	})

	const [isDeleteContentFileForm, setDeleteContentFileForm] = useState<{ content_uuid: string; file_role: 'preview' | 'full'; }>({
		content_uuid: '',
		file_role: 'preview'
	})

	const [isDeleteContentUuid, setDeleteContentUuid] = useState('')

	const [isCreateSaleHistoryForm, setCreateSaleHistoryForm] = useState<Type_saleHistoryCreateFormState>({
		sale_history_uuid: '',
		student_uuid_seller_sale_history: '',
		student_uuid_buyer_sale_history: '',
		content_uuid_sale_history: '',
		status_sale_history: 'completed',
		paid_to_seller_sale_history: '',
		information_content_sale_history: ''
	})

	const [isPatchSaleHistoryForm, setPatchSaleHistoryForm] = useState<Type_saleHistoryPatchFormState>({
		sale_history_uuid: '',
		student_uuid_seller_sale_history: '',
		student_uuid_buyer_sale_history: '',
		content_uuid_sale_history: '',
		status_sale_history: '',
		paid_to_seller_sale_history: '',
		information_content_sale_history: ''
	})

	const [isWebhookForm, setWebhookForm] = useState<Type_webhookFormState>({})

	const Const_studentArray = isMetricResponse?.studentArray || []
	const Const_collegeArrayMerged = useMemo<Type_metricCollege[]>(() => {
		const Const_resultMap = new Map<string, Type_metricCollege>()
		for (const Const_college of (isMetricResponse?.collegeArray || [])) {
			Const_resultMap.set(Const_college.college_uuid, Const_college)
		}
		for (const Const_college of isStudentOrAdminCollegeArray) {
			Const_resultMap.set(Const_college.college_uuid, Const_college)
		}
		return Array.from(Const_resultMap.values())
	}, [isMetricResponse?.collegeArray, isStudentOrAdminCollegeArray])
	const Const_courseArrayMerged = useMemo<Type_metricCourse[]>(() => {
		const Const_resultMap = new Map<string, Type_metricCourse>()
		for (const Const_course of (isMetricResponse?.courseArray || [])) {
			Const_resultMap.set(Const_course.course_uuid, Const_course)
		}
		for (const Const_course of isStudentOrAdminCourseArray) {
			Const_resultMap.set(Const_course.course_uuid, Const_course)
		}
		return Array.from(Const_resultMap.values())
	}, [isMetricResponse?.courseArray, isStudentOrAdminCourseArray])
	const Const_contentArray = isMetricResponse?.contentArray || []
	const Const_saleHistoryArray = isMetricResponse?.saleHistoryArray || []
	const Const_adminArray = isMetricResponse?.adminArray || []
	const Const_denunciaArray = isAdminDenunciaResponse?.denunciaArray || []

	const Const_studentOptionArray = useMemo<Type_selectOption[]>(
		() => Const_studentArray.map((Parameter_student) => ({
			value: Parameter_student.student_uuid,
			label: `${Parameter_student.student_uuid} (${Parameter_student.ra_student || Parameter_student.cpf_student || 'sem RA/CPF'})`
		})),
		[Const_studentArray]
	)

	const Const_collegeOptionArray = useMemo<Type_selectOption[]>(
		() => Const_collegeArrayMerged.map((Parameter_college) => ({
			value: Parameter_college.college_uuid,
			label: `${Parameter_college.name_college} (${Parameter_college.college_uuid})`
		})),
		[Const_collegeArrayMerged]
	)

	const Const_courseOptionArray = useMemo<Type_selectOption[]>(
		() => Const_courseArrayMerged.map((Parameter_course) => ({
			value: Parameter_course.course_uuid,
			label: `${Parameter_course.name_course} (${Parameter_course.course_uuid})`
		})),
		[Const_courseArrayMerged]
	)

	const Const_courseOptionArrayByCreateStudentCollege = useMemo<Type_selectOption[]>(() => {
		const Const_collegeUuidStudent = Function_getTrimmedStringOrUndefined(isCreateStudentForm.college_uuid_student)
		if (!Const_collegeUuidStudent) {
			return Const_courseOptionArray
		}

		return Const_courseArrayMerged
			.filter((Parameter_course) => Parameter_course.college_uuid_course === Const_collegeUuidStudent)
			.map((Parameter_course) => ({
				value: Parameter_course.course_uuid,
				label: `${Parameter_course.name_course} (${Parameter_course.course_uuid})`
			}))
	}, [Const_courseArrayMerged, Const_courseOptionArray, isCreateStudentForm.college_uuid_student])

	const Const_contentOptionArray = useMemo<Type_selectOption[]>(
		() => Const_contentArray.map((Parameter_content) => ({
			value: Parameter_content.content_uuid,
			label: `${Parameter_content.name_content} (${Parameter_content.content_uuid})`
		})),
		[Const_contentArray]
	)

	const Const_saleHistoryOptionArray = useMemo<Type_selectOption[]>(
		() => Const_saleHistoryArray.map((Parameter_saleHistory) => ({
			value: Parameter_saleHistory.sale_history_uuid,
			label: `${Parameter_saleHistory.sale_history_uuid} (${Parameter_saleHistory.status_sale_history || 'sem status'})`
		})),
		[Const_saleHistoryArray]
	)

	const Const_currentRequestLog = useMemo<Type_requestLog | undefined>(() => {
		if (isRequestLogArray.length <= 0) {
			return undefined
		}
		if (!isCurrentRequestLogId) {
			return isRequestLogArray[0]
		}
		return isRequestLogArray.find((Parameter_single) => Parameter_single.id === isCurrentRequestLogId) || isRequestLogArray[0]
	}, [isCurrentRequestLogId, isRequestLogArray])

	const Function_setCreateStudentCollegeUuid = useCallback((Parameter_collegeUuid: string): void => {
		setCreateStudentForm((Parameter_previous) => {
			const Const_courseIsValidToCollege = Const_courseArrayMerged.some((Parameter_course) =>
				Parameter_course.course_uuid === Parameter_previous.course_uuid_student
				&& Parameter_course.college_uuid_course === Parameter_collegeUuid
			)

			return {
				...Parameter_previous,
				college_uuid_student: Parameter_collegeUuid,
				course_uuid_student: Const_courseIsValidToCollege ? Parameter_previous.course_uuid_student : ''
			}
		})
	}, [Const_courseArrayMerged])

	const Function_fillGetAdminConteudoQueryNow = useCallback((): void => {
		try {
			const Const_queryObjectUnknown = JSON.parse(isGetAdminConteudoQueryJson) as unknown
			if (typeof Const_queryObjectUnknown !== 'object' || Const_queryObjectUnknown === null || Array.isArray(Const_queryObjectUnknown)) {
				alert('O JSON atual precisa ser objeto para preencher datas automaticamente.')
				return
			}

			const Const_queryObject = { ...(Const_queryObjectUnknown as Record<string, unknown>) }
			const Const_nowIsoString = Function_getNowIsoString()
			for (const Const_key of [
				'content_created_from',
				'content_created_to',
				'content_update_from',
				'content_update_to',
				'prevision_content_from',
				'prevision_content_to'
			]) {
				Const_queryObject[Const_key] = Const_nowIsoString
			}

			setGetAdminConteudoQueryJson(JSON.stringify(Const_queryObject, null, 2))
		}
		catch {
			alert('JSON inválido em GET /get/admin/conteudo.')
		}
	}, [isGetAdminConteudoQueryJson])

	const Function_runRequest = useCallback(async (Parameter_config: Type_requestRunConfig): Promise<Type_requestLog> => {
		const Const_requestKey = `${Parameter_config.method} ${Parameter_config.path}`
		setRunningRequestKey(Const_requestKey)

		if (!Const_backendBaseUrl) {
			const Const_requestLogWithoutBaseUrl: Type_requestLog = {
				id: crypto.randomUUID(),
				createdAt: new Date().toISOString(),
				method: Parameter_config.method,
				path: Parameter_config.path,
				url: Parameter_config.path,
				ok: false,
				status: null,
				durationMs: 0,
				requestPayload: Parameter_config.jsonBody || (Parameter_config.formDataBody ? Function_getFormDataPreviewObject(Parameter_config.formDataBody) : null),
				responsePayload: {
					error: 'NEXT_PUBLIC_Env_urlApiBackend não está definido no frontend.'
				},
				responseHeaders: {}
			}
			setRequestLogArray((Parameter_previous) => [Const_requestLogWithoutBaseUrl, ...Parameter_previous].slice(0, 120))
			setCurrentRequestLogId(Const_requestLogWithoutBaseUrl.id)
			setRunningRequestKey('')
			return Const_requestLogWithoutBaseUrl
		}

		const Const_url = new URL(`${Const_backendBaseUrl}${Parameter_config.path}`)
		if (Parameter_config.query) {
			for (const [Const_key, Const_value] of Object.entries(Parameter_config.query)) {
				if (Const_value === undefined || Const_value === null || String(Const_value).trim().length <= 0) {
					continue
				}
				Const_url.searchParams.set(Const_key, String(Const_value))
			}
		}

		const Const_requestInit: RequestInit = {
			method: Parameter_config.method,
			credentials: 'include'
		}

		let Let_requestPayload: unknown = null
		if (Parameter_config.formDataBody) {
			Const_requestInit.body = Parameter_config.formDataBody
			Let_requestPayload = Function_getFormDataPreviewObject(Parameter_config.formDataBody)
		}
		else if (Parameter_config.jsonBody) {
			Const_requestInit.headers = { 'content-type': 'application/json' }
			Const_requestInit.body = JSON.stringify(Parameter_config.jsonBody)
			Let_requestPayload = Parameter_config.jsonBody
		}

		const Const_startedAt = Date.now()
		let Let_requestLog: Type_requestLog

		try {
			const Const_response = await fetch(Const_url.toString(), Const_requestInit)
			const Const_responsePayload = await Function_getResponsePayload(Const_response)
			const Const_responseHeaders: Record<string, string> = {}
			for (const [Const_key, Const_value] of Array.from(Const_response.headers.entries())) {
				Const_responseHeaders[Const_key] = Const_value
			}

			Let_requestLog = {
				id: crypto.randomUUID(),
				createdAt: new Date().toISOString(),
				method: Parameter_config.method,
				path: Parameter_config.path,
				url: Const_url.toString(),
				ok: Const_response.ok,
				status: Const_response.status,
				durationMs: Date.now() - Const_startedAt,
				requestPayload: Let_requestPayload,
				responsePayload: Const_responsePayload,
				responseHeaders: Const_responseHeaders
			}
		}
		catch (Parameter_error) {
			Let_requestLog = {
				id: crypto.randomUUID(),
				createdAt: new Date().toISOString(),
				method: Parameter_config.method,
				path: Parameter_config.path,
				url: Const_url.toString(),
				ok: false,
				status: null,
				durationMs: Date.now() - Const_startedAt,
				requestPayload: Let_requestPayload,
				responsePayload: { error: String(Parameter_error) },
				responseHeaders: {}
			}
		}

		setRequestLogArray((Parameter_previous) => [Let_requestLog, ...Parameter_previous].slice(0, 120))
		setCurrentRequestLogId(Let_requestLog.id)
		setRunningRequestKey('')
		return Let_requestLog
	}, [Const_backendBaseUrl])

	const Function_refreshMetric = useCallback(async (): Promise<void> => {
		const Const_requestLog = await Function_runRequest({
			method: 'GET',
			path: '/get/admin/metrica'
		})

		if (Const_requestLog.ok && typeof Const_requestLog.responsePayload === 'object' && Const_requestLog.responsePayload !== null) {
			setMetricResponse(Const_requestLog.responsePayload as Type_metricResponse)
		}
	}, [Function_runRequest])

	const Function_refreshAdminDenuncia = useCallback(async (): Promise<void> => {
		const Const_requestLog = await Function_runRequest({
			method: 'GET',
			path: '/get/admin/denuncia',
			query: {
				limit: 200,
				page: 1,
				order_by: 'denuncia_created',
				order_direction: 'desc'
			}
		})

		if (Const_requestLog.ok && typeof Const_requestLog.responsePayload === 'object' && Const_requestLog.responsePayload !== null) {
			setAdminDenunciaResponse(Const_requestLog.responsePayload as Type_getAdminDenunciaResponse)
		}
	}, [Function_runRequest])

	const Function_refreshCollegeStudentOrAdmin = useCallback(async (): Promise<void> => {
		const Const_requestLog = await Function_runRequest({
			method: 'GET',
			path: '/get/student-or-admin/faculdade/todas'
		})
		if (Const_requestLog.ok && typeof Const_requestLog.responsePayload === 'object' && Const_requestLog.responsePayload !== null) {
			const Const_payloadTyped = Const_requestLog.responsePayload as Type_studentOrAdminCollegeResponse
			setStudentOrAdminCollegeArray(Array.isArray(Const_payloadTyped.collegeArray) ? Const_payloadTyped.collegeArray : [])
		}
	}, [Function_runRequest])

	const Function_fetchCourseStudentOrAdminByCollege = useCallback(async (Parameter_collegeUuidCourse: string): Promise<void> => {
		const Const_collegeUuidCourse = Function_getTrimmedStringOrUndefined(Parameter_collegeUuidCourse)
		if (!Const_collegeUuidCourse) {
			alert('Informe college_uuid_course para buscar cursos.')
			return
		}

		const Const_requestLog = await Function_runRequest({
			method: 'GET',
			path: '/get/student-or-admin/curso/especifico',
			query: {
				college_uuid_course: Const_collegeUuidCourse
			}
		})
		if (Const_requestLog.ok && typeof Const_requestLog.responsePayload === 'object' && Const_requestLog.responsePayload !== null) {
			const Const_payloadTyped = Const_requestLog.responsePayload as Type_studentOrAdminCourseResponse
			setStudentOrAdminCourseArray(Array.isArray(Const_payloadTyped.courseArray) ? Const_payloadTyped.courseArray : [])
		}
	}, [Function_runRequest])

	const Function_refreshAllReferenceData = useCallback(async (): Promise<void> => {
		await Promise.all([
			Function_refreshMetric(),
			Function_refreshCollegeStudentOrAdmin(),
			Function_refreshAdminDenuncia()
		])
	}, [Function_refreshMetric, Function_refreshCollegeStudentOrAdmin, Function_refreshAdminDenuncia])

	useEffect(() => {
		setAdminSessionStorage(Function_readAdminSessionStorage())
		setUtilityUuid(crypto.randomUUID())
		setUtilityNowIso(Function_getNowIsoString())
		setCreateSaleHistoryForm((Parameter_previous) => {
			if (Function_getTrimmedStringOrUndefined(Parameter_previous.sale_history_uuid)) {
				return Parameter_previous
			}
			return {
				...Parameter_previous,
				sale_history_uuid: crypto.randomUUID()
			}
		})
	}, [])

	useEffect(() => {
		Function_refreshAllReferenceData().catch(() => {
			// A ideia aqui é não bloquear UI em caso de falha.
		})
	}, [Function_refreshAllReferenceData])

	const Function_createStudent = async (): Promise<void> => {
		const Const_body = Function_getObjectWithoutUndefined({
			ra_student: Function_getTrimmedStringOrUndefined(isCreateStudentForm.ra_student),
			cpf_student: Function_getTrimmedStringOrUndefined(isCreateStudentForm.cpf_student),
			college_uuid_student: Function_getTrimmedStringOrUndefined(isCreateStudentForm.college_uuid_student),
			course_uuid_student: Function_getTrimmedStringOrUndefined(isCreateStudentForm.course_uuid_student),
			class_student: Function_getTrimmedStringOrUndefined(isCreateStudentForm.class_student)
		})

		const Const_requestLog = await Function_runRequest({
			method: 'POST',
			path: '/post/admin/student',
			jsonBody: Const_body
		})
		if (Const_requestLog.ok) {
			await Function_refreshMetric()
		}
	}

	const Function_createCollege = async (): Promise<void> => {
		const Const_body = Function_getObjectWithoutUndefined({
			college_uuid: Function_getTrimmedStringOrUndefined(isCreateCollegeForm.college_uuid),
			name_college: Function_getTrimmedStringOrUndefined(isCreateCollegeForm.name_college),
			svg_college: Function_getTrimmedStringOrNullOrUndefined(isCreateCollegeForm.svg_college)
		})

		if (typeof Const_body.name_college !== 'string') {
			alert('name_college é obrigatório.')
			return
		}

		const Const_requestLog = await Function_runRequest({
			method: 'POST',
			path: '/post/admin/faculdade',
			jsonBody: Const_body
		})
		if (Const_requestLog.ok) {
			await Function_refreshAllReferenceData()
		}
	}

	const Function_patchCollege = async (): Promise<void> => {
		const Const_collegeUuid = Function_getTrimmedStringOrUndefined(isPatchCollegeForm.college_uuid)
		if (!Const_collegeUuid) {
			alert('college_uuid é obrigatório para patch.')
			return
		}

		const Const_body = Function_getObjectWithoutUndefined({
			college_uuid: Const_collegeUuid,
			name_college: Function_getTrimmedStringOrUndefined(isPatchCollegeForm.name_college),
			svg_college: Function_getTrimmedStringOrNullOrUndefined(isPatchCollegeForm.svg_college)
		})

		const Const_requestLog = await Function_runRequest({
			method: 'PATCH',
			path: '/patch/admin/faculdade',
			jsonBody: Const_body
		})
		if (Const_requestLog.ok) {
			await Function_refreshAllReferenceData()
		}
	}

	const Function_deleteCollege = async (): Promise<void> => {
		const Const_collegeUuid = Function_getTrimmedStringOrUndefined(isDeleteCollegeUuid)
		if (!Const_collegeUuid) {
			alert('college_uuid é obrigatório para delete.')
			return
		}

		const Const_requestLog = await Function_runRequest({
			method: 'DELETE',
			path: '/delete/admin/faculdade',
			jsonBody: {
				college_uuid: Const_collegeUuid
			}
		})
		if (Const_requestLog.ok) {
			await Function_refreshAllReferenceData()
		}
	}

	const Function_createCourse = async (): Promise<void> => {
		const Const_body = Function_getObjectWithoutUndefined({
			course_uuid: Function_getTrimmedStringOrUndefined(isCreateCourseForm.course_uuid),
			name_course: Function_getTrimmedStringOrUndefined(isCreateCourseForm.name_course),
			svg_course: Function_getTrimmedStringOrNullOrUndefined(isCreateCourseForm.svg_course),
			college_uuid_course: Function_getTrimmedStringOrUndefined(isCreateCourseForm.college_uuid_course)
		})

		if (typeof Const_body.name_course !== 'string' || typeof Const_body.college_uuid_course !== 'string') {
			alert('name_course e college_uuid_course são obrigatórios.')
			return
		}

		const Const_requestLog = await Function_runRequest({
			method: 'POST',
			path: '/post/admin/curso',
			jsonBody: Const_body
		})
		if (Const_requestLog.ok) {
			await Function_refreshAllReferenceData()
		}
	}

	const Function_patchCourse = async (): Promise<void> => {
		const Const_courseUuid = Function_getTrimmedStringOrUndefined(isPatchCourseForm.course_uuid)
		if (!Const_courseUuid) {
			alert('course_uuid é obrigatório para patch.')
			return
		}

		const Const_body = Function_getObjectWithoutUndefined({
			course_uuid: Const_courseUuid,
			name_course: Function_getTrimmedStringOrUndefined(isPatchCourseForm.name_course),
			svg_course: Function_getTrimmedStringOrNullOrUndefined(isPatchCourseForm.svg_course),
			college_uuid_course: Function_getTrimmedStringOrUndefined(isPatchCourseForm.college_uuid_course)
		})

		const Const_requestLog = await Function_runRequest({
			method: 'PATCH',
			path: '/patch/admin/curso',
			jsonBody: Const_body
		})
		if (Const_requestLog.ok) {
			await Function_refreshAllReferenceData()
		}
	}

	const Function_deleteCourse = async (): Promise<void> => {
		const Const_courseUuid = Function_getTrimmedStringOrUndefined(isDeleteCourseUuid)
		if (!Const_courseUuid) {
			alert('course_uuid é obrigatório para delete.')
			return
		}

		const Const_requestLog = await Function_runRequest({
			method: 'DELETE',
			path: '/delete/admin/curso',
			jsonBody: {
				course_uuid: Const_courseUuid
			}
		})
		if (Const_requestLog.ok) {
			await Function_refreshAllReferenceData()
		}
	}

	const Function_createContent = async (): Promise<void> => {
		const Const_nameContent = Function_getTrimmedStringOrUndefined(isCreateContentForm.name_content)
		const Const_studentUuidContent = Function_getTrimmedStringOrUndefined(isCreateContentForm.student_uuid_content)
		const Const_collegeUuidContent = Function_getTrimmedStringOrUndefined(isCreateContentForm.college_uuid_content)
		const Const_courseUuidContent = Function_getTrimmedStringOrUndefined(isCreateContentForm.course_uuid_content)
		const Const_currentPriceContent = Function_getNumberOrUndefined(isCreateContentForm.current_price_content)

		if (!Const_nameContent || !Const_studentUuidContent || !Const_collegeUuidContent || !Const_courseUuidContent || typeof Const_currentPriceContent !== 'number') {
			alert('Campos obrigatórios do conteúdo: name_content, student_uuid_content, current_price_content, college_uuid_content, course_uuid_content.')
			return
		}

		if (isCreateContentForm.preview_file_content && Function_getTrimmedStringOrUndefined(isCreateContentForm.preview_file_uuid_content)) {
			alert('Escolha apenas preview_file_content OU preview_file_uuid_content.')
			return
		}
		if (isCreateContentForm.full_file_content && Function_getTrimmedStringOrUndefined(isCreateContentForm.full_file_uuid_content)) {
			alert('Escolha apenas full_file_content OU full_file_uuid_content.')
			return
		}

		const Const_formData = new FormData()
		Const_formData.set('name_content', Const_nameContent)
		Const_formData.set('student_uuid_content', Const_studentUuidContent)
		Const_formData.set('current_price_content', String(Const_currentPriceContent))
		Const_formData.set('college_uuid_content', Const_collegeUuidContent)
		Const_formData.set('course_uuid_content', Const_courseUuidContent)

		const Const_contentUuid = Function_getTrimmedStringOrUndefined(isCreateContentForm.content_uuid)
		if (Const_contentUuid) {
			Const_formData.set('content_uuid', Const_contentUuid)
		}

		const Const_oldPrice = Function_getNumberOrNullOrUndefined(isCreateContentForm.old_price_content)
		if (Const_oldPrice === null) {
			Const_formData.set('old_price_content', 'null')
		}
		else if (typeof Const_oldPrice === 'number') {
			Const_formData.set('old_price_content', String(Const_oldPrice))
		}

		const Const_previewUuid = Function_getTrimmedStringOrNullOrUndefined(isCreateContentForm.preview_file_uuid_content)
		if (Const_previewUuid === null) {
			Const_formData.set('preview_file_uuid_content', 'null')
		}
		else if (typeof Const_previewUuid === 'string') {
			Const_formData.set('preview_file_uuid_content', Const_previewUuid)
		}

		const Const_fullUuid = Function_getTrimmedStringOrNullOrUndefined(isCreateContentForm.full_file_uuid_content)
		if (Const_fullUuid === null) {
			Const_formData.set('full_file_uuid_content', 'null')
		}
		else if (typeof Const_fullUuid === 'string') {
			Const_formData.set('full_file_uuid_content', Const_fullUuid)
		}

		const Const_classContent = Function_getTrimmedStringOrNullOrUndefined(isCreateContentForm.class_content)
		if (Const_classContent === null) {
			Const_formData.set('class_content', 'null')
		}
		else if (typeof Const_classContent === 'string') {
			Const_formData.set('class_content', Const_classContent)
		}

		const Const_previsionContent = Function_getTrimmedStringOrNullOrUndefined(isCreateContentForm.prevision_content)
		if (Const_previsionContent === null) {
			Const_formData.set('prevision_content', 'null')
		}
		else if (typeof Const_previsionContent === 'string') {
			Const_formData.set('prevision_content', Const_previsionContent)
		}

		if (isCreateContentForm.verified_content === '0' || isCreateContentForm.verified_content === '1') {
			Const_formData.set('verified_content', isCreateContentForm.verified_content)
		}

		if (isCreateContentForm.preview_file_content) {
			Const_formData.set('preview_file_content', isCreateContentForm.preview_file_content)
		}
		if (isCreateContentForm.full_file_content) {
			Const_formData.set('full_file_content', isCreateContentForm.full_file_content)
		}

		const Const_requestLog = await Function_runRequest({
			method: 'POST',
			path: '/post/admin/conteudo',
			formDataBody: Const_formData
		})
		if (Const_requestLog.ok) {
			await Function_refreshMetric()
		}
	}

	const Function_uploadContentFile = async (): Promise<void> => {
		const Const_contentUuid = Function_getTrimmedStringOrUndefined(isUploadContentFileForm.content_uuid)
		if (!Const_contentUuid || !isUploadContentFileForm.file) {
			alert('content_uuid e arquivo são obrigatórios.')
			return
		}

		const Const_formData = new FormData()
		Const_formData.set('content_uuid', Const_contentUuid)
		Const_formData.set('file_role', isUploadContentFileForm.file_role)
		Const_formData.set('file', isUploadContentFileForm.file)

		const Const_requestLog = await Function_runRequest({
			method: 'POST',
			path: '/post/admin/conteudo/file',
			formDataBody: Const_formData
		})
		if (Const_requestLog.ok) {
			await Function_refreshMetric()
		}
	}

	const Function_patchContent = async (): Promise<void> => {
		const Const_contentUuid = Function_getTrimmedStringOrUndefined(isPatchContentForm.content_uuid)
		if (!Const_contentUuid) {
			alert('content_uuid é obrigatório para patch.')
			return
		}

		const Const_oldPrice = Function_getNumberOrNullOrUndefined(isPatchContentForm.old_price_content)
		const Const_currentPrice = Function_getNumberOrUndefined(isPatchContentForm.current_price_content)
		const Const_verifiedContent = isPatchContentForm.verified_content

		const Const_body = Function_getObjectWithoutUndefined({
			content_uuid: Const_contentUuid,
			content_uuid_new: Function_getTrimmedStringOrUndefined(isPatchContentForm.content_uuid_new),
			name_content: Function_getTrimmedStringOrUndefined(isPatchContentForm.name_content),
			student_uuid_content: Function_getTrimmedStringOrUndefined(isPatchContentForm.student_uuid_content),
			old_price_content: Const_oldPrice,
			current_price_content: Const_currentPrice,
			preview_file_uuid_content: Function_getTrimmedStringOrNullOrUndefined(isPatchContentForm.preview_file_uuid_content),
			full_file_uuid_content: Function_getTrimmedStringOrNullOrUndefined(isPatchContentForm.full_file_uuid_content),
			college_uuid_content: Function_getTrimmedStringOrUndefined(isPatchContentForm.college_uuid_content),
			course_uuid_content: Function_getTrimmedStringOrUndefined(isPatchContentForm.course_uuid_content),
			class_content: Function_getTrimmedStringOrNullOrUndefined(isPatchContentForm.class_content),
			prevision_content: Function_getTrimmedStringOrNullOrUndefined(isPatchContentForm.prevision_content),
			verified_content: Const_verifiedContent === '' ? undefined : Number(Const_verifiedContent)
		})

		const Const_requestLog = await Function_runRequest({
			method: 'PATCH',
			path: '/patch/admin/conteudo',
			jsonBody: Const_body
		})
		if (Const_requestLog.ok) {
			await Function_refreshMetric()
		}
	}

	const Function_deleteContentFile = async (): Promise<void> => {
		const Const_contentUuid = Function_getTrimmedStringOrUndefined(isDeleteContentFileForm.content_uuid)
		if (!Const_contentUuid) {
			alert('content_uuid é obrigatório.')
			return
		}

		const Const_requestLog = await Function_runRequest({
			method: 'DELETE',
			path: '/delete/admin/conteudo/file',
			jsonBody: {
				content_uuid: Const_contentUuid,
				file_role: isDeleteContentFileForm.file_role
			}
		})
		if (Const_requestLog.ok) {
			await Function_refreshMetric()
		}
	}

	const Function_deleteContent = async (): Promise<void> => {
		const Const_contentUuid = Function_getTrimmedStringOrUndefined(isDeleteContentUuid)
		if (!Const_contentUuid) {
			alert('content_uuid é obrigatório.')
			return
		}

		const Const_requestLog = await Function_runRequest({
			method: 'DELETE',
			path: '/delete/admin/conteudo',
			query: {
				content_uuid: Const_contentUuid
			}
		})
		if (Const_requestLog.ok) {
			await Function_refreshMetric()
		}
	}

	const Function_getAdminContent = async (): Promise<void> => {
		const Const_queryText = isGetAdminConteudoQueryJson.trim()
		let Let_queryObject: Record<string, Type_requestQueryValue> = {}

		if (Const_queryText.length > 0) {
			try {
				const Const_parsed = JSON.parse(Const_queryText) as unknown
				if (typeof Const_parsed !== 'object' || Const_parsed === null || Array.isArray(Const_parsed)) {
					alert('JSON de query precisa ser objeto, por exemplo {"limit":50,"page":1}.')
					return
				}
				Let_queryObject = Const_parsed as Record<string, Type_requestQueryValue>
			}
			catch {
				alert('JSON de query inválido.')
				return
			}
		}

		await Function_runRequest({
			method: 'GET',
			path: '/get/admin/conteudo',
			query: Let_queryObject
		})
	}

	const Function_createSaleHistory = async (): Promise<void> => {
		const Const_saleHistoryUuid = Function_getTrimmedStringOrUndefined(isCreateSaleHistoryForm.sale_history_uuid)
		const Const_studentUuidBuyer = Function_getTrimmedStringOrUndefined(isCreateSaleHistoryForm.student_uuid_buyer_sale_history)
		const Const_contentUuidSaleHistory = Function_getTrimmedStringOrUndefined(isCreateSaleHistoryForm.content_uuid_sale_history)
		const Const_statusSaleHistory = Function_getTrimmedStringOrUndefined(isCreateSaleHistoryForm.status_sale_history)
		if (!Const_saleHistoryUuid || !Const_studentUuidBuyer || !Const_contentUuidSaleHistory || !Const_statusSaleHistory) {
			alert('Campos obrigatórios: sale_history_uuid, student_uuid_buyer_sale_history, content_uuid_sale_history, status_sale_history.')
			return
		}

		const Const_body = Function_getObjectWithoutUndefined({
			sale_history_uuid: Const_saleHistoryUuid,
			student_uuid_seller_sale_history: Function_getTrimmedStringOrUndefined(isCreateSaleHistoryForm.student_uuid_seller_sale_history),
			student_uuid_buyer_sale_history: Const_studentUuidBuyer,
			content_uuid_sale_history: Const_contentUuidSaleHistory,
			status_sale_history: Const_statusSaleHistory,
			paid_to_seller_sale_history: Function_getTrimmedStringOrNullOrUndefined(isCreateSaleHistoryForm.paid_to_seller_sale_history),
			information_content_sale_history: Function_tryParseJsonOrString(isCreateSaleHistoryForm.information_content_sale_history)
		})

		const Const_requestLog = await Function_runRequest({
			method: 'POST',
			path: '/post/admin/historico-pagamento',
			jsonBody: Const_body
		})
		if (Const_requestLog.ok) {
			await Function_refreshMetric()
		}
	}

	const Function_patchSaleHistory = async (): Promise<void> => {
		const Const_saleHistoryUuid = Function_getTrimmedStringOrUndefined(isPatchSaleHistoryForm.sale_history_uuid)
		if (!Const_saleHistoryUuid) {
			alert('sale_history_uuid é obrigatório.')
			return
		}

		const Const_body = Function_getObjectWithoutUndefined({
			sale_history_uuid: Const_saleHistoryUuid,
			student_uuid_seller_sale_history: Function_getTrimmedStringOrUndefined(isPatchSaleHistoryForm.student_uuid_seller_sale_history),
			student_uuid_buyer_sale_history: Function_getTrimmedStringOrUndefined(isPatchSaleHistoryForm.student_uuid_buyer_sale_history),
			content_uuid_sale_history: Function_getTrimmedStringOrUndefined(isPatchSaleHistoryForm.content_uuid_sale_history),
			status_sale_history: Function_getTrimmedStringOrUndefined(isPatchSaleHistoryForm.status_sale_history),
			paid_to_seller_sale_history: Function_getTrimmedStringOrNullOrUndefined(isPatchSaleHistoryForm.paid_to_seller_sale_history),
			information_content_sale_history: Function_tryParseJsonOrString(isPatchSaleHistoryForm.information_content_sale_history)
		})

		const Const_requestLog = await Function_runRequest({
			method: 'PATCH',
			path: '/patch/admin/historico-pagamento',
			jsonBody: Const_body
		})
		if (Const_requestLog.ok) {
			await Function_refreshMetric()
		}
	}

	const Function_configWebhook = async (): Promise<void> => {
		await Function_runRequest({
			method: 'POST',
			path: '/post/admin/config-webhook-efi-bank',
			jsonBody: {}
		})
	}

	const Function_getWebhooks = async (): Promise<void> => {
		await Function_runRequest({
			method: 'GET',
			path: '/get/admin/config-webhook-efi-bank'
		})
	}

	const Function_logout = (): void => {
		Function_clearAdminArtifacts()
		setAdminSessionStorage(null)
		Const_router.push('/admin-login')
	}

	return (
		<main className="min-h-screen bg-[radial-gradient(circle_at_10%_10%,rgba(14,165,233,.18),transparent_45%),radial-gradient(circle_at_90%_0%,rgba(56,189,248,.15),transparent_38%),linear-gradient(180deg,#020617,#111827)] text-slate-100 px-4 py-6 md:px-8 md:py-8">
			<div className="mx-auto w-full max-w-[1800px]">
				<header className="rounded-2xl border border-slate-700/70 bg-slate-900/80 p-5 md:p-6">
					<div className="flex flex-wrap items-start justify-between gap-4">
						<div>
							<h1 className="text-2xl md:text-3xl font-bold tracking-tight">Painel Admin API</h1>
							<p className="mt-2 text-sm text-slate-300">
								Cobre todos os endpoints <code>/admin/*</code> e <code>/student-or-admin/*</code>, sempre mostrando JSON/erro retornado.
							</p>
						</div>

						<div className="flex flex-wrap gap-2">
							<Link href="/admin-login" className="rounded-lg border border-slate-500 px-3 py-2 text-sm font-semibold">
								/admin-login
							</Link>
							<button
								onClick={Function_refreshAllReferenceData}
								className="rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-slate-950"
							>
								Atualizar dados-base
							</button>
							<button
								onClick={Function_logout}
								className="rounded-lg border border-rose-400/70 px-3 py-2 text-sm font-semibold text-rose-200"
							>
								Sair/Limpar sessão
							</button>
						</div>
					</div>

					<div className="mt-4 grid gap-2 text-xs text-slate-300 md:grid-cols-3">
						<div className="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2">
							<p><strong>Backend:</strong> {Const_backendBaseUrl || 'NÃO CONFIGURADO'}</p>
						</div>
						<div className="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2">
							<p><strong>Admin atual:</strong> {isAdminSessionStorage?.admin?.email_admin || 'sem sessão local'}</p>
						</div>
						<div className="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2">
							<p><strong>Último login local:</strong> {isAdminSessionStorage?.loggedAt ? Function_getDateTimeLabel(isAdminSessionStorage.loggedAt) : 'n/a'}</p>
						</div>
					</div>

					<div className="mt-4 grid gap-2 text-xs md:grid-cols-5">
						<div className="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2">
							<p>students: <strong>{isMetricResponse?.metric?.studentCount ?? '-'}</strong></p>
						</div>
						<div className="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2">
							<p>colleges: <strong>{isMetricResponse?.metric?.collegeCount ?? '-'}</strong></p>
						</div>
						<div className="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2">
							<p>courses: <strong>{isMetricResponse?.metric?.courseCount ?? '-'}</strong></p>
						</div>
						<div className="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2">
							<p>contents: <strong>{isMetricResponse?.metric?.contentCount ?? '-'}</strong></p>
						</div>
						<div className="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2">
							<p>denuncias: <strong>{isMetricResponse?.metric?.denunciaCount ?? '-'}</strong></p>
						</div>
					</div>

					<section className="mt-4 rounded-xl border border-slate-700/80 bg-slate-900/70 p-4 md:p-5">
						<div className="flex flex-wrap items-center justify-between gap-2">
							<div>
								<h2 className="text-lg font-semibold">Denuncias recentes</h2>
								<p className="mt-1 text-xs text-slate-400">
									Total carregado: {isAdminDenunciaResponse?.pagination?.totalCount ?? Const_denunciaArray.length}
								</p>
							</div>
							<button
								onClick={Function_refreshAdminDenuncia}
								className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-900"
							>
								Atualizar denuncias
							</button>
						</div>

						<div className="mt-3 max-h-[320px] overflow-auto space-y-2 pr-1">
							{Const_denunciaArray.length > 0 ? (
								Const_denunciaArray.map((Parameter_denuncia) => (
									<div
										key={Parameter_denuncia.denuncia_uuid}
										className="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-3 text-xs text-slate-200"
									>
										<div className="flex flex-wrap items-center justify-between gap-2">
											<p className="font-semibold">
												{Parameter_denuncia.content_name_denuncia || 'Conteudo sem nome'} ({Parameter_denuncia.content_uuid_denuncia})
											</p>
											<span className="rounded-md border border-amber-400/60 bg-amber-300/20 px-2 py-0.5 text-[11px] font-semibold text-amber-100">
												{Parameter_denuncia.status_denuncia || 'pending'}
											</span>
										</div>
										<p className="mt-1 text-slate-300">
											Denunciante: {Parameter_denuncia.student_uuid_denuncia}
										</p>
										<p className="mt-1 text-slate-300">
											Quando: {Function_getDateTimeLabel(Parameter_denuncia.denuncia_created)}
										</p>
										<p className="mt-1 text-slate-100">
											Motivos: {Parameter_denuncia.reason_array_denuncia.length > 0 ? Parameter_denuncia.reason_array_denuncia.join(' | ') : 'n/a'}
										</p>
										{Parameter_denuncia.extra_information_denuncia ? (
											<p className="mt-1 text-slate-300">
												Info adicional: {Parameter_denuncia.extra_information_denuncia}
											</p>
										) : null}
									</div>
								))
							) : (
								<p className="text-sm text-slate-400">Nenhuma denuncia encontrada no momento.</p>
							)}
						</div>
					</section>

					<div className="mt-4 grid gap-2 text-xs md:grid-cols-2">
						<div className="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-3">
							<p className="font-semibold text-slate-200">Gerador de UUID</p>
							<p className="mt-2 break-all font-mono text-[11px] text-slate-300">{isUtilityUuid}</p>
							<button
								onClick={() => setUtilityUuid(crypto.randomUUID())}
								className="mt-2 rounded-lg border border-slate-500 px-3 py-2 text-xs font-semibold"
							>
								Gerar UUID
							</button>
						</div>
						<div className="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-3">
							<p className="font-semibold text-slate-200">Hora atual (ISO)</p>
							<p className="mt-2 break-all font-mono text-[11px] text-slate-300">{isUtilityNowIso}</p>
							<button
								onClick={() => setUtilityNowIso(Function_getNowIsoString())}
								className="mt-2 rounded-lg border border-slate-500 px-3 py-2 text-xs font-semibold"
							>
								Atualizar hora atual
							</button>
						</div>
					</div>
				</header>

				<section className="hidden">
					<div className="flex flex-wrap items-center gap-2">
						<button
							onClick={Function_refreshMetric}
							className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-900"
						>
							GET /get/admin/metrica
						</button>
						<button
							onClick={Function_refreshCollegeStudentOrAdmin}
							className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-900"
						>
							GET /get/student-or-admin/faculdade/todas
						</button>
						<div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-700 px-2 py-2">
							<Component_SelectOrTypeField
								label="college_uuid_course (para /curso/especifico)"
								value={isGetCourseByCollegeUuid}
								onChange={setGetCourseByCollegeUuid}
								options={Const_collegeOptionArray}
								listId="student-or-admin-course-college"
								placeholder="UUID da faculdade"
							/>
							<button
								onClick={() => Function_fetchCourseStudentOrAdminByCollege(isGetCourseByCollegeUuid)}
								className="rounded-lg bg-sky-500 px-3 py-2 text-xs font-semibold text-slate-950"
							>
								GET /get/student-or-admin/curso/especifico
							</button>
						</div>
					</div>
				</section>

				<section className="mt-4 rounded-xl border border-slate-700/80 bg-slate-900/70 p-4 md:p-5">
					<div className="flex items-center justify-between gap-2">
						<h2 className="text-lg font-semibold">Resultado Atual</h2>
						{isRunningRequestKey ? (
							<span className="rounded-lg bg-amber-300 px-2 py-1 text-xs font-semibold text-slate-900">
								Executando: {isRunningRequestKey}
							</span>
						) : null}
					</div>
					{Const_currentRequestLog ? (
						<>
							<div className="mt-3 grid gap-1 text-xs text-slate-300 md:grid-cols-2">
								<p><strong>Quando:</strong> {Function_getDateTimeLabel(Const_currentRequestLog.createdAt)}</p>
								<p><strong>Request:</strong> {Const_currentRequestLog.method} {Const_currentRequestLog.path}</p>
								<p><strong>Status:</strong> {Const_currentRequestLog.status ?? 'erro de rede'} {Const_currentRequestLog.ok ? '(ok)' : '(erro)'}</p>
								<p><strong>Duração:</strong> {Const_currentRequestLog.durationMs}ms</p>
								<p className="md:col-span-2"><strong>URL:</strong> {Const_currentRequestLog.url}</p>
							</div>

							<div className="mt-3 grid gap-3 md:grid-cols-2">
								<div>
									<p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Payload enviado</p>
									<pre className="mt-1 max-h-[240px] overflow-auto rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs">
										{JSON.stringify(Const_currentRequestLog.requestPayload, null, 2)}
									</pre>
								</div>
								<div>
									<p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Resposta</p>
									<pre className="mt-1 max-h-[240px] overflow-auto rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs">
										{JSON.stringify(Const_currentRequestLog.responsePayload, null, 2)}
									</pre>
								</div>
							</div>
						</>
					) : (
						<p className="mt-3 text-sm text-slate-400">Ainda não há requests executadas.</p>
					)}
				</section>

				<div className="mt-4 grid gap-4 lg:grid-cols-2">
					<section className="rounded-xl border border-slate-700/80 bg-slate-900/70 p-4 md:p-5">
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-semibold">Histórico de Requests</h2>
							<button
								onClick={() => {
									setRequestLogArray([])
									setCurrentRequestLogId(null)
								}}
								className="rounded-lg border border-slate-500 px-2 py-1 text-xs font-semibold"
							>
								Limpar
							</button>
						</div>

						<div className="mt-3 max-h-[260px] overflow-auto space-y-2 pr-1">
							{isRequestLogArray.map((Parameter_single) => (
								<button
									key={Parameter_single.id}
									onClick={() => setCurrentRequestLogId(Parameter_single.id)}
									className={`w-full rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
										isCurrentRequestLogId === Parameter_single.id
											? 'border-sky-400 bg-sky-500/10'
											: 'border-slate-700 bg-slate-950/70 hover:border-slate-500'
									}`}
								>
									<p className="font-semibold">
										{Parameter_single.method} {Parameter_single.path}
									</p>
									<p className="mt-1 text-slate-300">
										{Function_getDateTimeLabel(Parameter_single.createdAt)} | status: {Parameter_single.status ?? 'rede'} | {Parameter_single.durationMs}ms
									</p>
								</button>
							))}
							{isRequestLogArray.length <= 0 ? (
								<p className="text-sm text-slate-400">Sem histórico ainda.</p>
							) : null}
						</div>
					</section>

					<section className="rounded-xl border border-slate-700/80 bg-slate-900/70 p-4 md:p-5">
						<h2 className="text-lg font-semibold">Resumo de dados carregados</h2>
						<div className="mt-3 grid gap-2 text-xs text-slate-300">
							<p>admins: {Const_adminArray.length}</p>
							<p>students: {Const_studentArray.length}</p>
							<p>colleges: {Const_collegeArrayMerged.length}</p>
							<p>courses: {Const_courseArrayMerged.length}</p>
							<p>contents: {Const_contentArray.length}</p>
							<p>sale history: {Const_saleHistoryArray.length}</p>
							<p>denuncias: {Const_denunciaArray.length}</p>
							<p>student-or-admin colleges: {isStudentOrAdminCollegeArray.length}</p>
							<p>student-or-admin last courses: {isStudentOrAdminCourseArray.length}</p>
						</div>
					</section>
				</div>

				<div className="mt-4 grid gap-4">
					<div className="grid gap-4">
						<div className="rounded-xl border border-slate-700/80 bg-slate-900/70 px-4 py-3">
							<p className="text-sm font-semibold tracking-tight">Seção Estudante</p>
							<p className="mt-1 text-xs text-slate-400">Ordem: GET, POST, PATCH e DELETE. Endpoint disponível: POST.</p>
						</div>
						<Component_FormSection
							title="POST /post/admin/student"
							subtitle="Cria aluno com convite automático. Campo UUID pode ser escolhido na lista ou digitado manualmente."
						>
							<div className="grid gap-3 md:grid-cols-2">
								<Component_Field label="ra_student (opcional)" value={isCreateStudentForm.ra_student} onChange={(Parameter_value) => setCreateStudentForm((Parameter_previous) => ({ ...Parameter_previous, ra_student: Parameter_value }))} />
								<Component_Field label="cpf_student (opcional)" value={isCreateStudentForm.cpf_student} onChange={(Parameter_value) => setCreateStudentForm((Parameter_previous) => ({ ...Parameter_previous, cpf_student: Parameter_value }))} />
								<Component_SelectOrTypeField label="college_uuid_student (opcional)" value={isCreateStudentForm.college_uuid_student} onChange={Function_setCreateStudentCollegeUuid} options={Const_collegeOptionArray} listId="create-student-college" />
								<Component_SelectOrTypeField label="course_uuid_student (opcional)" value={isCreateStudentForm.course_uuid_student} onChange={(Parameter_value) => setCreateStudentForm((Parameter_previous) => ({ ...Parameter_previous, course_uuid_student: Parameter_value }))} options={Const_courseOptionArrayByCreateStudentCollege} listId="create-student-course" />
								<Component_Field label="class_student (opcional)" value={isCreateStudentForm.class_student} onChange={(Parameter_value) => setCreateStudentForm((Parameter_previous) => ({ ...Parameter_previous, class_student: Parameter_value }))} />
							</div>
							<button onClick={Function_createStudent} className="rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-slate-950">
								Executar
							</button>
						</Component_FormSection>

						<div className="rounded-xl border border-slate-700/80 bg-slate-900/70 px-4 py-3">
							<p className="text-sm font-semibold tracking-tight">Seção Faculdade</p>
							<p className="mt-1 text-xs text-slate-400">Ordem: GET, POST, PATCH e DELETE.</p>
						</div>
						<Component_FormSection title="GET /get/student-or-admin/faculdade/todas">
							<div className="flex flex-wrap gap-2">
								<button
									onClick={Function_refreshCollegeStudentOrAdmin}
									className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-900"
								>
									Executar GET faculdades
								</button>
							</div>
						</Component_FormSection>
						<Component_FormSection title="Faculdade (POST/PATCH/DELETE)" subtitle="Use 'null' em svg_college para limpar valor.">
							<div className="grid gap-3 md:grid-cols-2">
								<div className="rounded-lg border border-slate-700 p-3">
									<p className="mb-2 text-xs font-semibold text-slate-300">POST /post/admin/faculdade</p>
									<div className="grid gap-2">
										<Component_Field label="college_uuid (opcional)" value={isCreateCollegeForm.college_uuid} onChange={(Parameter_value) => setCreateCollegeForm((Parameter_previous) => ({ ...Parameter_previous, college_uuid: Parameter_value }))} />
										<Component_Field label="name_college (obrigatório)" value={isCreateCollegeForm.name_college} onChange={(Parameter_value) => setCreateCollegeForm((Parameter_previous) => ({ ...Parameter_previous, name_college: Parameter_value }))} required />
										<Component_Field label="svg_college (opcional, use null)" value={isCreateCollegeForm.svg_college} onChange={(Parameter_value) => setCreateCollegeForm((Parameter_previous) => ({ ...Parameter_previous, svg_college: Parameter_value }))} />
										<button onClick={Function_createCollege} className="rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-slate-950">Executar POST</button>
									</div>
								</div>

								<div className="rounded-lg border border-slate-700 p-3">
									<p className="mb-2 text-xs font-semibold text-slate-300">PATCH /patch/admin/faculdade</p>
									<div className="grid gap-2">
										<Component_SelectOrTypeField label="college_uuid (obrigatório)" value={isPatchCollegeForm.college_uuid} onChange={(Parameter_value) => setPatchCollegeForm((Parameter_previous) => ({ ...Parameter_previous, college_uuid: Parameter_value }))} options={Const_collegeOptionArray} listId="patch-college-uuid" />
										<Component_Field label="name_college (opcional)" value={isPatchCollegeForm.name_college} onChange={(Parameter_value) => setPatchCollegeForm((Parameter_previous) => ({ ...Parameter_previous, name_college: Parameter_value }))} />
										<Component_Field label="svg_college (opcional, use null)" value={isPatchCollegeForm.svg_college} onChange={(Parameter_value) => setPatchCollegeForm((Parameter_previous) => ({ ...Parameter_previous, svg_college: Parameter_value }))} />
										<button onClick={Function_patchCollege} className="rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-slate-950">Executar PATCH</button>
									</div>
								</div>
							</div>

							<div className="rounded-lg border border-slate-700 p-3">
								<p className="mb-2 text-xs font-semibold text-slate-300">DELETE /delete/admin/faculdade</p>
								<div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-end">
									<Component_SelectOrTypeField label="college_uuid (obrigatório)" value={isDeleteCollegeUuid} onChange={setDeleteCollegeUuid} options={Const_collegeOptionArray} listId="delete-college-uuid" />
									<button onClick={Function_deleteCollege} className="rounded-lg border border-rose-400/70 px-3 py-2 text-sm font-semibold text-rose-200">Executar DELETE</button>
								</div>
							</div>
						</Component_FormSection>

						<div className="rounded-xl border border-slate-700/80 bg-slate-900/70 px-4 py-3">
							<p className="text-sm font-semibold tracking-tight">Seção Curso</p>
							<p className="mt-1 text-xs text-slate-400">Ordem: GET, POST, PATCH e DELETE.</p>
						</div>
						<Component_FormSection title="GET /get/student-or-admin/curso/especifico">
							<div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-end">
								<Component_SelectOrTypeField
									label="college_uuid_course (obrigatório)"
									value={isGetCourseByCollegeUuid}
									onChange={setGetCourseByCollegeUuid}
									options={Const_collegeOptionArray}
									listId="section-curso-college-uuid"
								/>
								<button
									onClick={() => Function_fetchCourseStudentOrAdminByCollege(isGetCourseByCollegeUuid)}
									className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-900"
								>
									Executar GET cursos
								</button>
							</div>
						</Component_FormSection>
						<Component_FormSection title="Curso (POST/PATCH/DELETE)" subtitle="Use 'null' em svg_course para limpar valor.">
							<div className="grid gap-3 md:grid-cols-2">
								<div className="rounded-lg border border-slate-700 p-3">
									<p className="mb-2 text-xs font-semibold text-slate-300">POST /post/admin/curso</p>
									<div className="grid gap-2">
										<Component_Field label="course_uuid (opcional)" value={isCreateCourseForm.course_uuid} onChange={(Parameter_value) => setCreateCourseForm((Parameter_previous) => ({ ...Parameter_previous, course_uuid: Parameter_value }))} />
										<Component_Field label="name_course (obrigatório)" value={isCreateCourseForm.name_course} onChange={(Parameter_value) => setCreateCourseForm((Parameter_previous) => ({ ...Parameter_previous, name_course: Parameter_value }))} required />
										<Component_Field label="svg_course (opcional, use null)" value={isCreateCourseForm.svg_course} onChange={(Parameter_value) => setCreateCourseForm((Parameter_previous) => ({ ...Parameter_previous, svg_course: Parameter_value }))} />
										<Component_SelectOrTypeField label="college_uuid_course (obrigatório)" value={isCreateCourseForm.college_uuid_course} onChange={(Parameter_value) => setCreateCourseForm((Parameter_previous) => ({ ...Parameter_previous, college_uuid_course: Parameter_value }))} options={Const_collegeOptionArray} listId="create-course-college" />
										<button onClick={Function_createCourse} className="rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-slate-950">Executar POST</button>
									</div>
								</div>

								<div className="rounded-lg border border-slate-700 p-3">
									<p className="mb-2 text-xs font-semibold text-slate-300">PATCH /patch/admin/curso</p>
									<div className="grid gap-2">
										<Component_SelectOrTypeField label="course_uuid (obrigatório)" value={isPatchCourseForm.course_uuid} onChange={(Parameter_value) => setPatchCourseForm((Parameter_previous) => ({ ...Parameter_previous, course_uuid: Parameter_value }))} options={Const_courseOptionArray} listId="patch-course-uuid" />
										<Component_Field label="name_course (opcional)" value={isPatchCourseForm.name_course} onChange={(Parameter_value) => setPatchCourseForm((Parameter_previous) => ({ ...Parameter_previous, name_course: Parameter_value }))} />
										<Component_Field label="svg_course (opcional, use null)" value={isPatchCourseForm.svg_course} onChange={(Parameter_value) => setPatchCourseForm((Parameter_previous) => ({ ...Parameter_previous, svg_course: Parameter_value }))} />
										<Component_SelectOrTypeField label="college_uuid_course (opcional)" value={isPatchCourseForm.college_uuid_course} onChange={(Parameter_value) => setPatchCourseForm((Parameter_previous) => ({ ...Parameter_previous, college_uuid_course: Parameter_value }))} options={Const_collegeOptionArray} listId="patch-course-college" />
										<button onClick={Function_patchCourse} className="rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-slate-950">Executar PATCH</button>
									</div>
								</div>
							</div>

							<div className="rounded-lg border border-slate-700 p-3">
								<p className="mb-2 text-xs font-semibold text-slate-300">DELETE /delete/admin/curso</p>
								<div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-end">
									<Component_SelectOrTypeField label="course_uuid (obrigatório)" value={isDeleteCourseUuid} onChange={setDeleteCourseUuid} options={Const_courseOptionArray} listId="delete-course-uuid" />
									<button onClick={Function_deleteCourse} className="rounded-lg border border-rose-400/70 px-3 py-2 text-sm font-semibold text-rose-200">Executar DELETE</button>
								</div>
							</div>
						</Component_FormSection>

						<div className="rounded-xl border border-slate-700/80 bg-slate-900/70 px-4 py-3">
							<p className="text-sm font-semibold tracking-tight">Seção Conteúdo</p>
							<p className="mt-1 text-xs text-slate-400">Ordem: GET, POST, PATCH e DELETE.</p>
						</div>
						<Component_FormSection title="GET /get/admin/conteudo" subtitle="Exemplo padrao com todos os parametros disponiveis no endpoint.">
							<textarea
								value={isGetAdminConteudoQueryJson}
								onChange={(Parameter_event) => setGetAdminConteudoQueryJson(Parameter_event.target.value)}
								className="min-h-[160px] w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-xs outline-none focus:border-sky-400"
								spellCheck={false}
							/>
							<div className="flex flex-wrap gap-2">
								<button onClick={Function_getAdminContent} className="rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-slate-950">Executar GET conteudo</button>
								<button onClick={() => setGetAdminConteudoQueryJson(Const_getAdminConteudoQueryExample)} className="rounded-lg border border-slate-500 px-3 py-2 text-sm font-semibold">Restaurar exemplo completo</button>
								<button onClick={Function_fillGetAdminConteudoQueryNow} className="rounded-lg border border-slate-500 px-3 py-2 text-sm font-semibold">Preencher datas com hora atual</button>
							</div>
						</Component_FormSection>
						<Component_FormSection title="Conteúdo (POST /post/admin/conteudo)">
							<p className="text-xs text-slate-400">Use valor literal <code>null</code> nos campos opcionais nuláveis. Upload aceita PDF/HTML (até 5MB).</p>
							<div className="grid gap-3 md:grid-cols-2">
								<Component_Field label="content_uuid (opcional)" value={isCreateContentForm.content_uuid} onChange={(Parameter_value) => setCreateContentForm((Parameter_previous) => ({ ...Parameter_previous, content_uuid: Parameter_value }))} />
								<Component_Field label="name_content (obrigatório)" value={isCreateContentForm.name_content} onChange={(Parameter_value) => setCreateContentForm((Parameter_previous) => ({ ...Parameter_previous, name_content: Parameter_value }))} required />
								<Component_SelectOrTypeField label="student_uuid_content (obrigatório)" value={isCreateContentForm.student_uuid_content} onChange={(Parameter_value) => setCreateContentForm((Parameter_previous) => ({ ...Parameter_previous, student_uuid_content: Parameter_value }))} options={Const_studentOptionArray} listId="create-content-student-uuid" />
								<Component_Field label="current_price_content (obrigatório)" value={isCreateContentForm.current_price_content} onChange={(Parameter_value) => setCreateContentForm((Parameter_previous) => ({ ...Parameter_previous, current_price_content: Parameter_value }))} type="number" />
								<Component_Field label="old_price_content (opcional / null)" value={isCreateContentForm.old_price_content} onChange={(Parameter_value) => setCreateContentForm((Parameter_previous) => ({ ...Parameter_previous, old_price_content: Parameter_value }))} />
								<Component_SelectOrTypeField label="college_uuid_content (obrigatório)" value={isCreateContentForm.college_uuid_content} onChange={(Parameter_value) => setCreateContentForm((Parameter_previous) => ({ ...Parameter_previous, college_uuid_content: Parameter_value }))} options={Const_collegeOptionArray} listId="create-content-college-uuid" />
								<Component_SelectOrTypeField label="course_uuid_content (obrigatório)" value={isCreateContentForm.course_uuid_content} onChange={(Parameter_value) => setCreateContentForm((Parameter_previous) => ({ ...Parameter_previous, course_uuid_content: Parameter_value }))} options={Const_courseOptionArray} listId="create-content-course-uuid" />
								<Component_Field label="class_content (opcional / null)" value={isCreateContentForm.class_content} onChange={(Parameter_value) => setCreateContentForm((Parameter_previous) => ({ ...Parameter_previous, class_content: Parameter_value }))} />
								<div className="grid gap-2">
									<Component_Field label="prevision_content (opcional / null)" value={isCreateContentForm.prevision_content} onChange={(Parameter_value) => setCreateContentForm((Parameter_previous) => ({ ...Parameter_previous, prevision_content: Parameter_value }))} placeholder="2026-12-31T23:59:59.000Z" />
									<div className="flex flex-wrap gap-2">
										<button onClick={() => setCreateContentForm((Parameter_previous) => ({ ...Parameter_previous, prevision_content: isUtilityNowIso }))} className="rounded-lg border border-slate-500 px-3 py-2 text-xs font-semibold">Usar hora atual</button>
									</div>
								</div>
								<div className="grid gap-1">
									<span className="text-xs font-medium text-slate-300">verified_content (opcional)</span>
									<select
										value={isCreateContentForm.verified_content}
										onChange={(Parameter_event) => setCreateContentForm((Parameter_previous) => ({ ...Parameter_previous, verified_content: Parameter_event.target.value as '' | '0' | '1' }))}
										className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-400"
									>
										<option value="">Não enviar</option>
										<option value="0">0</option>
										<option value="1">1</option>
									</select>
								</div>
								<Component_Field label="preview_file_uuid_content (opcional / null)" value={isCreateContentForm.preview_file_uuid_content} onChange={(Parameter_value) => setCreateContentForm((Parameter_previous) => ({ ...Parameter_previous, preview_file_uuid_content: Parameter_value }))} />
								<Component_Field label="full_file_uuid_content (opcional / null)" value={isCreateContentForm.full_file_uuid_content} onChange={(Parameter_value) => setCreateContentForm((Parameter_previous) => ({ ...Parameter_previous, full_file_uuid_content: Parameter_value }))} />
								<label className="grid gap-1">
									<span className="text-xs font-medium text-slate-300">preview_file_content (opcional)</span>
									<input
										type="file"
										accept=".pdf,.html,text/html,application/pdf"
										onChange={(Parameter_event) => setCreateContentForm((Parameter_previous) => ({ ...Parameter_previous, preview_file_content: Parameter_event.target.files?.[0] || null }))}
										className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-xs outline-none focus:border-sky-400"
									/>
								</label>
								<label className="grid gap-1">
									<span className="text-xs font-medium text-slate-300">full_file_content (opcional)</span>
									<input
										type="file"
										accept=".pdf,.html,text/html,application/pdf"
										onChange={(Parameter_event) => setCreateContentForm((Parameter_previous) => ({ ...Parameter_previous, full_file_content: Parameter_event.target.files?.[0] || null }))}
										className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-xs outline-none focus:border-sky-400"
									/>
								</label>
							</div>
							<button onClick={Function_createContent} className="rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-slate-950">Executar POST conteúdo</button>
						</Component_FormSection>

						<Component_FormSection title="Conteúdo arquivo (POST /post/admin/conteudo/file)">
							<div className="grid gap-3 md:grid-cols-2">
								<Component_SelectOrTypeField label="content_uuid (obrigatório)" value={isUploadContentFileForm.content_uuid} onChange={(Parameter_value) => setUploadContentFileForm((Parameter_previous) => ({ ...Parameter_previous, content_uuid: Parameter_value }))} options={Const_contentOptionArray} listId="upload-content-file-content-uuid" />
								<label className="grid gap-1">
									<span className="text-xs font-medium text-slate-300">file_role</span>
									<select
										value={isUploadContentFileForm.file_role}
										onChange={(Parameter_event) => setUploadContentFileForm((Parameter_previous) => ({ ...Parameter_previous, file_role: Parameter_event.target.value as 'preview' | 'full' }))}
										className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-400"
									>
										<option value="preview">preview</option>
										<option value="full">full</option>
									</select>
								</label>
								<label className="grid gap-1 md:col-span-2">
									<span className="text-xs font-medium text-slate-300">file (PDF/HTML)</span>
									<input
										type="file"
										accept=".pdf,.html,text/html,application/pdf"
										onChange={(Parameter_event) => setUploadContentFileForm((Parameter_previous) => ({ ...Parameter_previous, file: Parameter_event.target.files?.[0] || null }))}
										className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-xs outline-none focus:border-sky-400"
									/>
								</label>
							</div>
							<button onClick={Function_uploadContentFile} className="rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-slate-950">Executar upload</button>
						</Component_FormSection>

						<Component_FormSection title="PATCH /patch/admin/conteudo" subtitle="Campos opcionais: envie somente o que deseja alterar. Use null nos campos nuláveis.">
							<div className="grid gap-3 md:grid-cols-2">
								<Component_SelectOrTypeField label="content_uuid (obrigatório)" value={isPatchContentForm.content_uuid} onChange={(Parameter_value) => setPatchContentForm((Parameter_previous) => ({ ...Parameter_previous, content_uuid: Parameter_value }))} options={Const_contentOptionArray} listId="patch-content-uuid" />
								<Component_Field label="content_uuid_new (opcional)" value={isPatchContentForm.content_uuid_new} onChange={(Parameter_value) => setPatchContentForm((Parameter_previous) => ({ ...Parameter_previous, content_uuid_new: Parameter_value }))} />
								<Component_Field label="name_content (opcional)" value={isPatchContentForm.name_content} onChange={(Parameter_value) => setPatchContentForm((Parameter_previous) => ({ ...Parameter_previous, name_content: Parameter_value }))} />
								<Component_SelectOrTypeField label="student_uuid_content (opcional)" value={isPatchContentForm.student_uuid_content} onChange={(Parameter_value) => setPatchContentForm((Parameter_previous) => ({ ...Parameter_previous, student_uuid_content: Parameter_value }))} options={Const_studentOptionArray} listId="patch-content-student-uuid" />
								<Component_Field label="old_price_content (opcional / null)" value={isPatchContentForm.old_price_content} onChange={(Parameter_value) => setPatchContentForm((Parameter_previous) => ({ ...Parameter_previous, old_price_content: Parameter_value }))} />
								<Component_Field label="current_price_content (opcional)" value={isPatchContentForm.current_price_content} onChange={(Parameter_value) => setPatchContentForm((Parameter_previous) => ({ ...Parameter_previous, current_price_content: Parameter_value }))} />
								<Component_Field label="preview_file_uuid_content (opcional / null)" value={isPatchContentForm.preview_file_uuid_content} onChange={(Parameter_value) => setPatchContentForm((Parameter_previous) => ({ ...Parameter_previous, preview_file_uuid_content: Parameter_value }))} />
								<Component_Field label="full_file_uuid_content (opcional / null)" value={isPatchContentForm.full_file_uuid_content} onChange={(Parameter_value) => setPatchContentForm((Parameter_previous) => ({ ...Parameter_previous, full_file_uuid_content: Parameter_value }))} />
								<Component_SelectOrTypeField label="college_uuid_content (opcional)" value={isPatchContentForm.college_uuid_content} onChange={(Parameter_value) => setPatchContentForm((Parameter_previous) => ({ ...Parameter_previous, college_uuid_content: Parameter_value }))} options={Const_collegeOptionArray} listId="patch-content-college-uuid" />
								<Component_SelectOrTypeField label="course_uuid_content (opcional)" value={isPatchContentForm.course_uuid_content} onChange={(Parameter_value) => setPatchContentForm((Parameter_previous) => ({ ...Parameter_previous, course_uuid_content: Parameter_value }))} options={Const_courseOptionArray} listId="patch-content-course-uuid" />
								<Component_Field label="class_content (opcional / null)" value={isPatchContentForm.class_content} onChange={(Parameter_value) => setPatchContentForm((Parameter_previous) => ({ ...Parameter_previous, class_content: Parameter_value }))} />
								<div className="grid gap-2">
									<Component_Field label="prevision_content (opcional / null)" value={isPatchContentForm.prevision_content} onChange={(Parameter_value) => setPatchContentForm((Parameter_previous) => ({ ...Parameter_previous, prevision_content: Parameter_value }))} />
									<div className="flex flex-wrap gap-2">
										<button onClick={() => setPatchContentForm((Parameter_previous) => ({ ...Parameter_previous, prevision_content: isUtilityNowIso }))} className="rounded-lg border border-slate-500 px-3 py-2 text-xs font-semibold">Usar hora atual</button>
									</div>
								</div>
								<div className="grid gap-1">
									<span className="text-xs font-medium text-slate-300">verified_content (opcional)</span>
									<select
										value={isPatchContentForm.verified_content}
										onChange={(Parameter_event) => setPatchContentForm((Parameter_previous) => ({ ...Parameter_previous, verified_content: Parameter_event.target.value as '' | '0' | '1' }))}
										className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-400"
									>
										<option value="">Não enviar</option>
										<option value="0">0</option>
										<option value="1">1</option>
									</select>
								</div>
							</div>
							<button onClick={Function_patchContent} className="rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-slate-950">Executar PATCH conteúdo</button>
						</Component_FormSection>

						<Component_FormSection title="DELETE conteúdo e arquivos">
							<div className="grid gap-3 md:grid-cols-2">
								<div className="rounded-lg border border-slate-700 p-3">
									<p className="mb-2 text-xs font-semibold text-slate-300">DELETE /delete/admin/conteudo/file</p>
									<div className="grid gap-2">
										<Component_SelectOrTypeField label="content_uuid" value={isDeleteContentFileForm.content_uuid} onChange={(Parameter_value) => setDeleteContentFileForm((Parameter_previous) => ({ ...Parameter_previous, content_uuid: Parameter_value }))} options={Const_contentOptionArray} listId="delete-content-file-content-uuid" />
										<label className="grid gap-1">
											<span className="text-xs font-medium text-slate-300">file_role</span>
											<select
												value={isDeleteContentFileForm.file_role}
												onChange={(Parameter_event) => setDeleteContentFileForm((Parameter_previous) => ({ ...Parameter_previous, file_role: Parameter_event.target.value as 'preview' | 'full' }))}
												className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-400"
											>
												<option value="preview">preview</option>
												<option value="full">full</option>
											</select>
										</label>
										<button onClick={Function_deleteContentFile} className="rounded-lg border border-rose-400/70 px-3 py-2 text-sm font-semibold text-rose-200">Executar DELETE arquivo</button>
									</div>
								</div>

								<div className="rounded-lg border border-slate-700 p-3">
									<p className="mb-2 text-xs font-semibold text-slate-300">DELETE /delete/admin/conteudo</p>
									<div className="grid gap-2">
										<Component_SelectOrTypeField label="content_uuid (query)" value={isDeleteContentUuid} onChange={setDeleteContentUuid} options={Const_contentOptionArray} listId="delete-content-content-uuid" />
										<button onClick={Function_deleteContent} className="rounded-lg border border-rose-400/70 px-3 py-2 text-sm font-semibold text-rose-200">Executar DELETE conteúdo</button>
									</div>
								</div>
							</div>
						</Component_FormSection>
						<div className="rounded-xl border border-slate-700/80 bg-slate-900/70 px-4 py-3">
							<p className="text-sm font-semibold tracking-tight">Seção Pagamento</p>
							<p className="mt-1 text-xs text-slate-400">Ordem: GET, POST, PATCH e DELETE. GET de métricas está no bloco superior.</p>
						</div>
						<Component_FormSection title="GET /get/admin/metrica">
							<div className="flex flex-wrap gap-2">
								<button
									onClick={Function_refreshMetric}
									className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-900"
								>
									Executar GET metrica
								</button>
							</div>
						</Component_FormSection>
						<Component_FormSection title="GET /get/admin/denuncia">
							<div className="flex flex-wrap items-center gap-2">
								<button
									onClick={Function_refreshAdminDenuncia}
									className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-900"
								>
									Executar GET denuncia
								</button>
								<p className="text-xs text-slate-300">
									denuncias carregadas: <strong>{Const_denunciaArray.length}</strong>
								</p>
							</div>
						</Component_FormSection>
						<Component_FormSection title="Histórico de pagamento (POST/PATCH)">
							<div className="grid gap-3 md:grid-cols-2">
								<div className="rounded-lg border border-slate-700 p-3">
									<p className="mb-2 text-xs font-semibold text-slate-300">POST /post/admin/historico-pagamento</p>
									<div className="grid gap-2">
										<Component_Field label="sale_history_uuid (obrigatório)" value={isCreateSaleHistoryForm.sale_history_uuid} onChange={(Parameter_value) => setCreateSaleHistoryForm((Parameter_previous) => ({ ...Parameter_previous, sale_history_uuid: Parameter_value }))} />
										<div className="flex flex-wrap gap-2">
											<button onClick={() => setCreateSaleHistoryForm((Parameter_previous) => ({ ...Parameter_previous, sale_history_uuid: crypto.randomUUID() }))} className="rounded-lg border border-slate-500 px-3 py-2 text-xs font-semibold">
												Gerar UUID
											</button>
											<button onClick={() => setCreateSaleHistoryForm((Parameter_previous) => ({ ...Parameter_previous, sale_history_uuid: isUtilityUuid }))} className="rounded-lg border border-slate-500 px-3 py-2 text-xs font-semibold">
												Usar UUID gerado
											</button>
										</div>
										<Component_SelectOrTypeField label="student_uuid_buyer_sale_history (obrigatório)" value={isCreateSaleHistoryForm.student_uuid_buyer_sale_history} onChange={(Parameter_value) => setCreateSaleHistoryForm((Parameter_previous) => ({ ...Parameter_previous, student_uuid_buyer_sale_history: Parameter_value }))} options={Const_studentOptionArray} listId="create-sale-history-buyer" />
										<Component_SelectOrTypeField label="student_uuid_seller_sale_history (opcional)" value={isCreateSaleHistoryForm.student_uuid_seller_sale_history} onChange={(Parameter_value) => setCreateSaleHistoryForm((Parameter_previous) => ({ ...Parameter_previous, student_uuid_seller_sale_history: Parameter_value }))} options={Const_studentOptionArray} listId="create-sale-history-seller" />
										<Component_SelectOrTypeField label="content_uuid_sale_history (obrigatório)" value={isCreateSaleHistoryForm.content_uuid_sale_history} onChange={(Parameter_value) => setCreateSaleHistoryForm((Parameter_previous) => ({ ...Parameter_previous, content_uuid_sale_history: Parameter_value }))} options={Const_contentOptionArray} listId="create-sale-history-content" />
										<Component_Field label="status_sale_history (obrigatório)" value={isCreateSaleHistoryForm.status_sale_history} onChange={(Parameter_value) => setCreateSaleHistoryForm((Parameter_previous) => ({ ...Parameter_previous, status_sale_history: Parameter_value }))} />
										<div className="grid gap-2">
											<Component_Field label="paid_to_seller_sale_history (opcional / null)" value={isCreateSaleHistoryForm.paid_to_seller_sale_history} onChange={(Parameter_value) => setCreateSaleHistoryForm((Parameter_previous) => ({ ...Parameter_previous, paid_to_seller_sale_history: Parameter_value }))} placeholder="2026-04-30T15:00:00.000Z ou null" />
											<div className="flex flex-wrap gap-2">
												<button onClick={() => setCreateSaleHistoryForm((Parameter_previous) => ({ ...Parameter_previous, paid_to_seller_sale_history: isUtilityNowIso }))} className="rounded-lg border border-slate-500 px-3 py-2 text-xs font-semibold">Usar hora atual</button>
											</div>
										</div>
										<label className="grid gap-1">
											<span className="text-xs font-medium text-slate-300">information_content_sale_history (opcional JSON/string/null)</span>
											<textarea
												value={isCreateSaleHistoryForm.information_content_sale_history}
												onChange={(Parameter_event) => setCreateSaleHistoryForm((Parameter_previous) => ({ ...Parameter_previous, information_content_sale_history: Parameter_event.target.value }))}
												className="min-h-[90px] w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-xs outline-none focus:border-sky-400"
											/>
										</label>
										<button onClick={Function_createSaleHistory} className="rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-slate-950">Executar POST histórico</button>
									</div>
								</div>

								<div className="rounded-lg border border-slate-700 p-3">
									<p className="mb-2 text-xs font-semibold text-slate-300">PATCH /patch/admin/historico-pagamento</p>
									<div className="grid gap-2">
										<Component_SelectOrTypeField label="sale_history_uuid (obrigatório)" value={isPatchSaleHistoryForm.sale_history_uuid} onChange={(Parameter_value) => setPatchSaleHistoryForm((Parameter_previous) => ({ ...Parameter_previous, sale_history_uuid: Parameter_value }))} options={Const_saleHistoryOptionArray} listId="patch-sale-history-uuid" />
										<Component_SelectOrTypeField label="student_uuid_buyer_sale_history (opcional)" value={isPatchSaleHistoryForm.student_uuid_buyer_sale_history} onChange={(Parameter_value) => setPatchSaleHistoryForm((Parameter_previous) => ({ ...Parameter_previous, student_uuid_buyer_sale_history: Parameter_value }))} options={Const_studentOptionArray} listId="patch-sale-history-buyer" />
										<Component_SelectOrTypeField label="student_uuid_seller_sale_history (opcional)" value={isPatchSaleHistoryForm.student_uuid_seller_sale_history} onChange={(Parameter_value) => setPatchSaleHistoryForm((Parameter_previous) => ({ ...Parameter_previous, student_uuid_seller_sale_history: Parameter_value }))} options={Const_studentOptionArray} listId="patch-sale-history-seller" />
										<Component_SelectOrTypeField label="content_uuid_sale_history (opcional)" value={isPatchSaleHistoryForm.content_uuid_sale_history} onChange={(Parameter_value) => setPatchSaleHistoryForm((Parameter_previous) => ({ ...Parameter_previous, content_uuid_sale_history: Parameter_value }))} options={Const_contentOptionArray} listId="patch-sale-history-content" />
										<Component_Field label="status_sale_history (opcional)" value={isPatchSaleHistoryForm.status_sale_history} onChange={(Parameter_value) => setPatchSaleHistoryForm((Parameter_previous) => ({ ...Parameter_previous, status_sale_history: Parameter_value }))} />
										<div className="grid gap-2">
											<Component_Field label="paid_to_seller_sale_history (opcional / null)" value={isPatchSaleHistoryForm.paid_to_seller_sale_history} onChange={(Parameter_value) => setPatchSaleHistoryForm((Parameter_previous) => ({ ...Parameter_previous, paid_to_seller_sale_history: Parameter_value }))} placeholder="ISO ou null" />
											<div className="flex flex-wrap gap-2">
												<button onClick={() => setPatchSaleHistoryForm((Parameter_previous) => ({ ...Parameter_previous, paid_to_seller_sale_history: isUtilityNowIso }))} className="rounded-lg border border-slate-500 px-3 py-2 text-xs font-semibold">Usar hora atual</button>
											</div>
										</div>
										<label className="grid gap-1">
											<span className="text-xs font-medium text-slate-300">information_content_sale_history (opcional JSON/string/null)</span>
											<textarea
												value={isPatchSaleHistoryForm.information_content_sale_history}
												onChange={(Parameter_event) => setPatchSaleHistoryForm((Parameter_previous) => ({ ...Parameter_previous, information_content_sale_history: Parameter_event.target.value }))}
												className="min-h-[90px] w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-xs outline-none focus:border-sky-400"
											/>
										</label>
										<button onClick={Function_patchSaleHistory} className="rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-slate-950">Executar PATCH histórico</button>
									</div>
								</div>
							</div>
						</Component_FormSection>

						<div className="rounded-xl border border-slate-700/80 bg-slate-900/70 px-4 py-3">
							<p className="text-sm font-semibold tracking-tight">Seção Configuração</p>
							<p className="mt-1 text-xs text-slate-400">Endpoints disponíveis: GET e POST.</p>
						</div>
						<p className="text-xs text-slate-400">Gerencia webhooks usando <code className="text-slate-300">Env_webhookUrlBase</code> configurado no backend.</p>
						<div className="flex flex-wrap gap-2">
							<button onClick={Function_configWebhook} className="rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-slate-950">POST - Ativar Webhook</button>
							<button onClick={Function_getWebhooks} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-900">GET - Listar Webhooks</button>
						</div>
					</div>
					<div className="hidden">
						<section className="rounded-xl border border-slate-700/80 bg-slate-900/70 p-4 md:p-5">
							<div className="flex items-center justify-between gap-2">
								<h2 className="text-lg font-semibold">Resultado Atual</h2>
								{isRunningRequestKey ? (
									<span className="rounded-lg bg-amber-300 px-2 py-1 text-xs font-semibold text-slate-900">
										Executando: {isRunningRequestKey}
									</span>
								) : null}
							</div>
							{Const_currentRequestLog ? (
								<>
									<div className="mt-3 grid gap-1 text-xs text-slate-300">
										<p><strong>Quando:</strong> {Function_getDateTimeLabel(Const_currentRequestLog.createdAt)}</p>
										<p><strong>Request:</strong> {Const_currentRequestLog.method} {Const_currentRequestLog.path}</p>
										<p><strong>Status:</strong> {Const_currentRequestLog.status ?? 'erro de rede'} {Const_currentRequestLog.ok ? '(ok)' : '(erro)'}</p>
										<p><strong>Duração:</strong> {Const_currentRequestLog.durationMs}ms</p>
										<p><strong>URL:</strong> {Const_currentRequestLog.url}</p>
									</div>

									<div className="mt-3">
										<p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Payload enviado</p>
										<pre className="mt-1 max-h-[220px] overflow-auto rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs">
											{JSON.stringify(Const_currentRequestLog.requestPayload, null, 2)}
										</pre>
									</div>

									<div className="mt-3">
										<p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Resposta</p>
										<pre className="mt-1 max-h-[300px] overflow-auto rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs">
											{JSON.stringify(Const_currentRequestLog.responsePayload, null, 2)}
										</pre>
									</div>
								</>
							) : (
								<p className="mt-3 text-sm text-slate-400">Ainda não há requests executadas.</p>
							)}
						</section>

						<section className="rounded-xl border border-slate-700/80 bg-slate-900/70 p-4 md:p-5">
							<div className="flex items-center justify-between">
								<h2 className="text-lg font-semibold">Histórico de Requests</h2>
								<button
									onClick={() => {
										setRequestLogArray([])
										setCurrentRequestLogId(null)
									}}
									className="rounded-lg border border-slate-500 px-2 py-1 text-xs font-semibold"
								>
									Limpar
								</button>
							</div>

							<div className="mt-3 max-h-[880px] overflow-auto space-y-2 pr-1">
								{isRequestLogArray.map((Parameter_single) => (
									<button
										key={Parameter_single.id}
										onClick={() => setCurrentRequestLogId(Parameter_single.id)}
										className={`w-full rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
											isCurrentRequestLogId === Parameter_single.id
												? 'border-sky-400 bg-sky-500/10'
												: 'border-slate-700 bg-slate-950/70 hover:border-slate-500'
										}`}
									>
										<p className="font-semibold">
											{Parameter_single.method} {Parameter_single.path}
										</p>
										<p className="mt-1 text-slate-300">
											{Function_getDateTimeLabel(Parameter_single.createdAt)} | status: {Parameter_single.status ?? 'rede'} | {Parameter_single.durationMs}ms
										</p>
									</button>
								))}
								{isRequestLogArray.length <= 0 ? (
									<p className="text-sm text-slate-400">Sem histórico ainda.</p>
								) : null}
							</div>
						</section>

						<section className="rounded-xl border border-slate-700/80 bg-slate-900/70 p-4 md:p-5">
							<h2 className="text-lg font-semibold">Resumo de dados carregados</h2>
							<div className="mt-3 grid gap-2 text-xs text-slate-300">
								<p>admins: {Const_adminArray.length}</p>
								<p>students: {Const_studentArray.length}</p>
								<p>colleges: {Const_collegeArrayMerged.length}</p>
								<p>courses: {Const_courseArrayMerged.length}</p>
								<p>contents: {Const_contentArray.length}</p>
								<p>sale history: {Const_saleHistoryArray.length}</p>
								<p>denuncias: {Const_denunciaArray.length}</p>
								<p>student-or-admin colleges: {isStudentOrAdminCollegeArray.length}</p>
								<p>student-or-admin last courses: {isStudentOrAdminCourseArray.length}</p>
							</div>
						</section>
					</div>
				</div>
			</div>
		</main>
	)
}








