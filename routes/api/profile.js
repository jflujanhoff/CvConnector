const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const mongoose = require("mongoose");

const User = require("../../models/User");
const Profile = require("../../models/Profile");
mongoose.set("useFindAndModify", false);

// GET api/profile/me
// Get current user
// PRIVATE
router.get("/me", auth, async (req, res) => {
  const { id } = req.user;
  try {
    const profile = await Profile.findOne({ user: id }).populate("user", [
      "name",
      "avatar"
    ]);
    console.log(profile);

    if (!profile) {
      return res
        .status(400)
        .json({ msg: "There is not profile for this user" });
    }

    return res.json(profile);
  } catch (error) {
    console.log(error.message);

    res.status(500).json("Server error");
  }
});

// POST api/profile
// Create or update profile to user
// PRIVATE

router.post(
  "/",
  [
    auth,
    [
      check("status", "status is required")
        .not()
        .notEmpty(),
      check("skills", "skills is required")
        .not()
        .notEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors + "hellooooo");

      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = req.body;

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(",").map(skill => skill.trim());
    }

    // Build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;
    console.log("1------------");
    console.log(profileFields);

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      console.log("2------------");
      console.log(profile);

      if (profile) {
        // Update the profile
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }
      //   create profile if not exists
      profile = new Profile(profileFields);
      await profile.save();
      return res.json(profile);
    } catch (error) {
      console.log(error);
      res.status(500).send("Server error" + error.message);
    }
  }
);

// GET api/profiles
// Get all profiles in a list
// PUBLIC

router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    return res.json(profiles);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error 2");
  }
});

// GET api/profile/user/:use_id
// Get a profile by user ID (user_id)
// PUBLIC

router.get("/user/:user_id", async (req, res) => {
  const { user_id } = req.params;
  try {
    const profile = await Profile.findOne({ user: user_id }).populate("user", [
      "name",
      "avatar"
    ]);
    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for that user" });
    }
    return res.json(profile);
  } catch (error) {
    console.error(error);

    if (error.kind == "ObjectId") {
      return res.status(400).json({ msg: "There is no profile for that user" });
    }
    return res.status(500).send("Server error 2");
  }
});

// DELETE api/profile
// DELETE profile and user
// PRIVATE

router.delete("/", auth, async (req, res) => {
  try {
    const { id } = req.user;
    //   Delete Profile
    await Profile.findOneAndRemove({ user: id });
    // Delete User
    await User.findOneAndRemove({ _id: id });

    return res.json({ msg: "User deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error 3");
  }
});

// PUT api/profile/experience
// Add experience of the user's profile (put since it is an update)
// PRIVATE

router.put("/experience", [
  auth,
  [
    check("title", "Title is required")
      .not()
      .notEmpty(),
    check("company", "Company is required")
      .not()
      .isEmpty(),
    check("from", "From is required")
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = req.body;

    const newExperience = {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      console.log(profile);

      profile.experience.unshift(newExperience);

      await profile.save();

      return res.json(profile);
    } catch (error) {
      console.log(error.message);

      return res.status(500).send("Server error 4");
    }
  }
]);

// DELETE api/profile/experience/profile_id
// Delete the experience of the profile by ID.
// PRIVATE

router.delete("/experience/:experience_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const indexExperience = profile.experience
      .map(set => set.id)
      .indexOf(req.params.experience_id);

    profile.experience.splice(indexExperience, 1);
    await profile.save();

    return res.json(profile);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ msg: error.message });
  }
});

// PUT api/profile/education
// Add education of the user's profile (put since it is an update)
// PRIVATE

router.put("/education", [
  auth,
  [
    check("school", "School is required")
      .not()
      .notEmpty(),
    check("degree", "Degree is required")
      .not()
      .isEmpty(),
    check("fieldofstudy", "Field of study is required")
      .not()
      .isEmpty(),
    check("from", "From is required")
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    } = req.body;

    const newEducation = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      console.log(profile);

      profile.education.unshift(newEducation);

      await profile.save();

      return res.json(profile);
    } catch (error) {
      console.log(error.message);

      return res.status(500).send("Server error 4");
    }
  }
]);

// DELETE api/profile/education/education_id
// Delete the education of the profile by ID.
// PRIVATE

router.delete("/education/:education_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const indexEducation = profile.education
      .map(set => set.id)
      .indexOf(req.params.education_id);

    profile.education.splice(indexEducation, 1);
    await profile.save();

    return res.json(profile);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ msg: error.message });
  }
});

module.exports = router;
