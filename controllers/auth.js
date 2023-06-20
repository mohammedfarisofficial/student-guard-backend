import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'


export const register = async (req,res) => {

    try {
        const { 
            name,
            email,
            dept,
            password,
            lat,
            lng,
            role,
            headId
        } = req.body

        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(password,salt)

        //reg head

        if(role==="head"){
            const newHead = new User({
                name,
                email,
                dept,
                password: hashedPassword,
                lat,
                lng,
                role
            })
            
            newHead.save()
        }

        //reg student

        if(role==='student'){
            const newStudent = new User({
                name,
                email,
                dept,
                password: hashedPassword,
                lat,
                lng,
                role,
                headId
            })
            newStudent.save()
            return res.status(200).json({  newStudent });
        }


    } catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }

}


export const login = async (req,res) => {
    try {
        const { email,password,role} = req.body
        const user = await User.findOne({ email,role })

        if(!user) res.status(400).json({msg: "User does't exist!"})

        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch) return res.status(400).json({ msg: "Invalid credentials. " });


        if(req.body.notificationToken){
            await User.findOneAndUpdate({email},{
                notificationToken: req.body.notificationToken
            })
        }


        const token = jwt.sign({id: user._id},process.env.JWT_SECRET)
        delete user.password;
        return res.status(200).json({ token, user });
        
        
    } catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }

}

export const logout = async (req,res) => {
    try {
        const { userId } = req.params
        const user = await User.findByIdAndUpdate(userId,{
            notificationToken: ""
        })

        if(!user) console.log("something went wrong")
        return res.status(200).json({  user });

    } catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
}