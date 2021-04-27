import React from "react"
import CircularProgress from "@material-ui/core/CircularProgress"
import "./Sending.css"

export const Sending = () => {
	return (
			<div className="sending">
				<CircularProgress className="sending__item" color="secondary"/>
                <div className="sending__text">Wait for the end of the loading...</div>
			</div>

	)
}
