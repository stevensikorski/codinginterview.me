import React from "react";

export default function Register() {
    return (
        <div>
            <form method="POST" action={`%{process.env.REACT_APP_BACKEND_HOST}/register`}>
                <input type="text" placeholder="email" name="email"></input>
                <input type="password" placeholder="password" name="password"></input>
                <input type="submit" value="submit"></input>
            </form>
        </div>
    );
}
