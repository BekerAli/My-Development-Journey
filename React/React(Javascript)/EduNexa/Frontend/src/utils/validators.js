export function validateEmail(email){
    if(!email.trim()){
        return 'Email is required'
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if(!emailPattern.test(email)){
        return 'Enter a valid email'
    }

    return ""
}

export function validatePassword(password){
    if(password === ""){
        return 'Password is required'
    }

    return ""
}