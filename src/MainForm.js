import React from "react"
import { useData } from "./DataContext"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers"
import { PrimaryButton } from "./components/PrimaryButton"
import { MainContainer } from "./components/MainContainer"
import { Form } from "./components/Form"
import { InputForm } from "./components/InputForm"
import { Sending } from "./components/Sending"
import { render } from "@testing-library/react"
import * as yup from "yup"
import "react-phone-number-input/style.css"

const schema = yup.object().shape({
	domain: yup
		.string()
		.matches(
			/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/,
			"Domain incorrect"
		)
		.required("Domain is a required field"),
})
export const MainForm = () => {
	const { data } = useData()
	const { register, handleSubmit, errors } = useForm({
		defaultValues: {
			domain: data.domain,
		},
		mode: "onChange",
		resolver: yupResolver(schema),
	})
	const onSubmit = (data) => {
		fetch("http://localhost:8000/testAPI", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				domain: data.domain,
			}),
		})
			.then((res) => console.log(res))
			.then((err) => err)

		function get() {
			fetch(`http://localhost:8000/testAPI/status/${data.domain}`, {
				method: "GET",
				headers: { "Content-Type": "application/json" },
			})
			.then((res) => {
				res.text().then((body) => {
					let res = JSON.parse(body)
					if (res.lastReq === false) {
						get()
					} else {
						console.log(res)
					}
				})
			})
		}
		get()
		render(<Sending />)
	}
	return (
		<MainContainer>
			<Form onSubmit={handleSubmit(onSubmit)}>
				<InputForm
					placeholder="Enter Domain"
					ref={register}
					id="domain"
					type="text"
					label="Domain"
					name="domain"
					error={!!errors.domain}
					helperText={errors?.domain?.message}
				/>
				<PrimaryButton>Attached domain</PrimaryButton>
			</Form>
		</MainContainer>
	)
}
