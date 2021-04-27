import React, { forwardRef } from "react"
import TextField from "@material-ui/core/TextField"
import Checkbox from "@material-ui/core/Checkbox"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import "./Input.css"

export const InputForm = forwardRef((props, ref) => {
	return (
		<TextField
			variant="outlined"
			margin="normal"
			inputRef={ref}
			fullWidth
			{...props}
		/>
	)
})

export const InputCheckbox = forwardRef((props, ref) => {
	return (
		<FormControlLabel
			style={{ position: "relative", marginTop: "10px", paddingLeft: "40px" }}
			control={
				<Checkbox
					style={{ position: "absolute", top: "-10px", left: "0" }}
					fontSize="small"
					color="primary"
					inputRef={ref}
					{...props}
				/>
			}
			label="I agree to to the collection of my email address for the
		purposes of receiving commercial offers that we believe will be
		of interest to you on behalf of the companies and industries
		explicitly detailed in our Terms & Conditions and Privacy
		Policy."
		/>
	)
})
