const User = require('../models/user');
const Product = require('../models/product');
const Review = require('../models/review');

//프로필(profile.ejs) 전송 라우트
module.exports.renderProfile = async (req, res) => {
    const user = await User.findById(req.user.id).populate({ //중첩 채우기 
        path: 'reviews',
        populate: {
            path: 'author'
        }
    })
    if (!user) {
        req.flash('error', 'Cannot find that user!');
        return res.redirect('/products')
    }
    res.render('users/profile', { user })
}

// 프로필편집(profileEdit.ejs) 수정라우트
module.exports.renderEditProfile = async (req, res) => {
    const { id } = req.user;
    const user = await User.findById(id);
    res.render('users/profileEdit', { user })
}
//프로필편집(profileEdit.ejs) 폼에서 받아 제출하는 곳
module.exports.editProfile = async (req, res) => {
    const { id } = req.user;
    const user = await User.findByIdAndUpdate(id, { ...req.body.user })
    req.flash('success', 'Successfully updated users!')
    res.redirect(`/users/${user._id}`)
}

// 프로필 삭제 라우트
module.exports.deleteProfile = async (req, res) => {
    const { id } = req.user;
    // 리뷰 작성자 삭제 반복문
    while (await Review.findOne({ author: id })) {
        await Review.findOneAndDelete({ author: id })
    }
    await User.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted user!')
    res.redirect('/products');
}