import passwordValidator from 'password-validator'

// UNCOMMENT BELOW when finished testing
// Perform basic checks on passwords 
// const passwordSchema = new passwordValidator();
// passwordSchema
// .is().min(12)                                   // Minimum length 12
// .is().max(100)                                  // Maximum length 100
// .has().uppercase()                              // Must have uppercase letters
// .has().lowercase()                              // Must have lowercase letters
// .has().digits()                                 // Must have digits
// .has().symbols()                                // Must have symbols
// .not().spaces();  

// Checks password by taking in a password as input and a passwordValidator object 
// as the other input representing the password policy
const checkPasswordStrength = (password, passwordSchema) => {
    if (passwordSchema.validate(password)){
        return true
    }
    return false
}

