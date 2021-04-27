import React from "react"
import { forwardRef } from "react"
import TextField from "@material-ui/core/TextField"
import { makeStyles } from "@material-ui/core/styles"
import "./Input.css"

// const useStyles = makeStyles((theme) => ({
//   root: {
//     margin: theme.spacing(3, 0, 2),
//   },
// }));

const phoneInput = (props, ref) => {
	// const styles = useStyles();

	return (
		<TextField
		
			className="phone__input"
			inputRef={ref}
			fullWidth
			// InputProps={{
			//   className: styles.input
			// }}
			label="Phone Number"
			variant="outlined"
			name="phone"
			{...props}
		/>
	)
}
export default forwardRef(phoneInput)
