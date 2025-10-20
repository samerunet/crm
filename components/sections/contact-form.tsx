"use client";

import { useState, type FormEvent } from "react";

export default function ContactForm() {
	const [state, setState] = useState<"idle" | "sending" | "ok" | "err">("idle");
	const [err, setErr] = useState<string | null>(null);
	const [fields, setFields] = useState({
		name: "",
		email: "",
		phone: "",
		topic: "weddings",
		message: "",
	});

	async function onSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setErr(null);
		setState("sending");
		const fd = new FormData(e.currentTarget);
		const payload: any = Object.fromEntries(fd.entries());
		payload.topic = payload.topic || "other";
		try {
			const res = await fetch("/api/contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			const json = await res.json();
			if (!res.ok || !json.ok) throw new Error(json.error || "Failed to send");
			setState("ok");
			e.currentTarget.reset();
			setFields({
				name: "",
				email: "",
				phone: "",
				topic: "weddings",
				message: "",
			});
		} catch (e: any) {
			setErr(e.message || "Something went wrong");
			setState("err");
		}
	}

	const smsSummary = [
		`Name: ${fields.name || ""}`,
		fields.email ? `Email: ${fields.email}` : "",
		fields.phone ? `Phone: ${fields.phone}` : "",
		fields.topic ? `Topic: ${fields.topic}` : "",
		"",
		fields.message || "",
	]
		.filter(Boolean)
		.join("\n");

	const smsHref = `sms:+16193996160?&body=${encodeURIComponent(smsSummary)}`;

	return (
		<div className='glass specular rounded-2xl border border-border/70 p-5 sm:p-6'>
			<h3 className='text-lg font-semibold tracking-tight'>Quick contact</h3>
			<p className='mt-1 text-sm text-muted-foreground'>
				Email us or text the details—whatever’s fastest for you.
			</p>

			<form onSubmit={onSubmit} className='mt-4 grid gap-3'>
				{/* Honeypot field - keep empty */}
				<input
					type='text'
					name='company'
					className='hidden'
					tabIndex={-1}
					autoComplete='off'
				/>

				<div className='grid sm:grid-cols-2 gap-3'>
					<div>
						<label className='text-xs text-muted-foreground'>Name</label>
						<input
							name='name'
							required
							value={fields.name}
							onChange={(e) =>
								setFields((prev) => ({ ...prev, name: e.target.value }))
							}
							className='crm-input mt-1'
							placeholder='Your name'
						/>
					</div>
					<div>
						<label className='text-xs text-muted-foreground'>Email</label>
						<input
							type='email'
							name='email'
							required
							value={fields.email}
							onChange={(e) =>
								setFields((prev) => ({ ...prev, email: e.target.value }))
							}
							className='crm-input mt-1'
							placeholder='you@email.com'
						/>
					</div>
				</div>

				<div className='grid sm:grid-cols-2 gap-3'>
					<div>
						<label className='text-xs text-muted-foreground'>
							Phone (optional)
						</label>
						<input
							name='phone'
							value={fields.phone}
							onChange={(e) =>
								setFields((prev) => ({ ...prev, phone: e.target.value }))
							}
							className='crm-input mt-1'
							placeholder='+1 (___) ___-____'
						/>
					</div>
					<div>
						<label className='text-xs text-muted-foreground'>Topic</label>
						<select
							name='topic'
							className='crm-input mt-1'
							value={fields.topic}
							onChange={(e) =>
								setFields((prev) => ({ ...prev, topic: e.target.value }))
							}
						>
							<option value='weddings'>Weddings</option>
							<option value='editorial'>Editorial / On-Set</option>
							<option value='studio'>Studio Appointment</option>
							<option value='other'>Other</option>
						</select>
					</div>
				</div>

				<div>
					<label className='text-xs text-muted-foreground'>Message</label>
					<textarea
						name='message'
						required
						value={fields.message}
						onChange={(e) =>
							setFields((prev) => ({ ...prev, message: e.target.value }))
						}
						className='crm-input mt-1 min-h-[120px]'
						placeholder='Date, party size, location, and any details…'
					/>
				</div>

				<div className='flex flex-wrap gap-3 pt-1'>
					<button
						type='submit'
						disabled={state === "sending"}
						className='gbtn rounded-full px-5 h-11 inline-flex items-center justify-center specular disabled:opacity-60'
					>
						{state === "sending" ? "Sending…" : "Send email"}
					</button>

					{/* Opens native SMS composer with the same details */}
					<a
						href={smsHref}
						className='inline-flex h-11 items-center rounded-full px-4 border border-border/70 bg-card/70 backdrop-blur hover:bg-accent/20'
					>
						Text instead
					</a>
					{state === "ok" && (
						<span className='text-sm text-foreground/80'>
							Thanks! We’ll reply shortly.
						</span>
					)}
					{state === "err" && (
						<span className='text-sm text-destructive'>{err}</span>
					)}
				</div>
			</form>
		</div>
	);
}
