import React from 'react';

export default function Register() {
    return (
        <div>
            <form method="POST" action="http://localhost:3002/foo">
                <input type="text" placeholder="email" name="email"></input>
                <input type="password" placeholder="password" name="password"></input>
                <input type="submit" value="submit"></input>
            </form>
        </div>
    );
}