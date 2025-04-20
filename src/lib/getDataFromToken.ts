import { NextRequest } from "next/server";
import jwt from 'jsonwebtoken'


export const getDataFromToken = (request:NextRequest) => {
    try {
        // Get token from cookie
        const token = request.cookies.get("token")?.value || "";
        
        // Check if token exists
        if (!token) {
            return null;
        }
        
        // Check if TOKEN_SECRET is defined
        if (!process.env.TOKEN_SECRET) {
            console.error("TOKEN_SECRET is not defined in environment variables");
            return null;
        }
        
        // Verify token
        const decodeToken:any = jwt.verify(token, process.env.TOKEN_SECRET);
        
        return decodeToken.id;
    } catch (error:any) {
        console.error("Token verification error:", error.message);
        return null;
    }
}