import Course from "../models/course.model.js"
import AppError from "../utils/error.util.js";
import cloudinary from 'cloudinary';
import fs from 'fs/promises';

const getAllCourses = async function(req, res, next) {
    try{
        const courses = await Course.find({}).select('-lectures');

        res.status(200).json({
            success: true,
            message: 'All courses',
            courses,
        })
    } catch(e) {
        return next(
            new AppError(e.message, 500)
        )
    }
}

const getLecturesByCourseId = async function(req, res, next) {
    try{
        const {id} = req.params;
        // console.log('Course Id >', id);
        const course = await Course.findById(id);
        // console.log('Course Detail >', course);

        if(!course) {
            return next(
                new AppError('Invalid course id', 400)
            )
        }

        res.status(200).json({
            success: true,
            message: 'Course lectures fetched successfully',
            lectures: course.lectures
        })
    } catch(e) {
        return next(
            new AppError(e.message, 500)
        )
    }
}

const createCourse = async (req, res, next) => {
    try{
        const { title, description, category, createdBy } = req.body;
    
        if(!title || !description || !category || !createdBy) {
            return next(
                new AppError('All fields are required', 400)
            )
        }
    
        const course = await Course.create(
            {
                title,
                description,
                category,
                createdBy,
                thumbnail: {
                    public_id: 'Dummy',
                    secure_url: 'Dummy',
                }
            }
        );
    
        if (!course) {
            return next(
                new AppError('Course could not create, please try again', 500)
            )
        }
        
        if (req.file) {
            try{
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: 'lms'
                });
                // console.log(JSON.stringify(result));
                if (result) {
                    course.thumbnail.public_id = result.public_id;
                    course.thumbnail.secure_url = result.secure_url;
                }
        
                fs.rm(`uploads/${req.file.filename}`);
            }catch(e){
                return next(e.message, save)
            }
        }
    
        await course.save();
    
        res.status(200).json({
            success: true,
            message: 'Course created successfully',
            course,
        })

    }
    catch(error){
        return next(new AppError(error.message, 500));
    }
}

const updateCourse = async (req, res, next) => {
    try{
        const { id } = req.params;
        const course = await Course.findByIdAndUpdate(
            id,
            {
                $set: req.body //here we are doing upsert
            },
            {
                runValidators: true
            }
        );

        if(!course) {
            return next(
                new AppError('Course with given id does not exist', 500)
            )
        }

        res.status(200).json({
            success: true,
            message: 'Course updated succesfully',
            course
        })
    } catch(e){
        return next(
            new AppError(e.message, 500)
        )
    }
}

const removeCourse = async (req, res, next) => {
    try{
        const { id } = req.params;
        const course = await Course.findById(id);

        if(!course) {
            return next(
                new AppError('Course with given id does not exist', 500)
            )
        }

        await Course.findByIdAndDelete(id);
        //extra
        await cloudinary.v2.uploader.
        destroy(course.thumbnail.public_id);

        res.status(200).json({
            success: true,
            message: 'Course deleted successfully'
        })
    } catch(e) {
        return next(
            new AppError(e.message, 500)
        )
    }
}

const addLectureToCourseById = async (req, res, next) => {
    try{

        const { title, description  } = req.body;
        const { id } = req.params;
    
        const course = await Course.findById(id);
    
        if (!course) {
            return next(
                new AppError('Course with given id does not exist', 500)
            )
        }
    
        const lectureData = {
            title,
            description,
            lecture: {}
        };
    
        if (req.file) {
            try{
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: 'lms'
                });
                // console.log(JSON.stringify(result));
                if (result) {
                    lectureData.lecture.public_id = result.public_id;
                    lectureData.lecture.secure_url = result.secure_url;
                }
        
                fs.rm(`uploads/${req.file.filename}`);
            }catch(e){
                if(req.file) {
                    fs.em(`uploads/${req.file.filename}`);
                }
                return next(e.message, save)
            }
        }

        console.log('lecture> ', JSON.stringify(lectureData));
        course.lectures.push(lectureData);
    
        course.numbersOfLectures = course.lectures.length;
        
        await course.save();
    
        res.status(200).json({
            success: true,
            message: 'Lectures successfully added to the course',
            course
        })
    }catch(e) {
        return next(
            new AppError(e.message, 500)
        )
    }
}

const viewLecture = async(req, res, next) => {
    try{
        const{ courseid, lectureid } = req.params;

        const course = await Course.findById(courseid);

        if(!course) {
            return next(new AppError("Could not found", 400));
        }

        const lecture = await Course.
        findOne(
            {
                _id: courseid,
                "lectures._id":lectureid,
            },
            {
                _id:0,
                "lectures.$": 1,
            }
        );

        if(!lecture) {
            return next(new AppError("Lecture not found", 400));
        }

        res.status(200).json({
            success: true,
            message: "Lecture fetched successfully",
            lecture: lecture.lectures[0],
        });
    } catch(error) {
        return next(new AppError(err.message, 500));
    }
};

const createLecture = async (req, res, next) => {
    try {
        const { title, description } = req.body;
        const id = req.params.id;

        if (!title || !description || !req.file) {
            return next(new AppError("All fields are required", 400));
        }

        const course = await Course.findById(id);

        if (!course) {
            return next(
                new AppError("Course with given id doesnot exist", 400)
            );
        }

        const lectureData = {
            title,
            description,
            lecture: {},
        };

        if (req.file) {
            try {
                const result = await cloudinary.v2.uploader.upload(
                    req.file.path,
                    {
                        folder: "lms",
                        resource_type: "video",
                    }
                );

                if (result) {
                    lectureData.lecture.public_id = result.public_id;
                    lectureData.lecture.secure_url = result.secure_url;

                    fs.rm(`uploads/${req.file.filename}`);
                }
            } catch (error) {
                fs.rm(`uploads/${req.file.filename}`);
                return next(
                    new AppError(
                        error.message || "File not uploaded, please try again",
                        400
                    )
                );
            }
        }

        course.lectures.push(lectureData);
        course.numbersOfLectures = course.lectures.length;

        await course.save();

        res.status(200).json({
            success: true,
            messsage: "Lecture added to the course successfully",
            course,
        });
    } catch (error) {
        if (req.file) {
            fs.rm(`uploads/${req.file.filename}`);
        }
        return next(new AppError(error.message, 500));
    }
};

const updateLecture = async (req, res, next) => {
    try {
        const { courseid, lectureid } = req.params;

        const course = await Course.findById(courseid);

        if (!course) {
            return next(new AppError("Course not found", 400));
        }

        const lecture = await Course.findOne(
            {
                _id: courseid,
                "lectures._id": lectureid,
            },
            {
                _id: 0,
                "lectures.$": 1,
            }
        );

        if (!lecture) {
            return next(new AppError("Lecture not found", 400));
        }

        const { title, description } = req.body;

        const updateFields = {};

        if (title) {
            updateFields["lectures.$.title"] = title;
        }

        if (description) {
            updateFields["lectures.$.description"] = description;
        }

        if (req.file) {
            try {
                const public_id = lecture.lectures[0].lecture.public_id;

                await cloudinary.v2.uploader.destroy(public_id);

                const result = await cloudinary.v2.uploader.upload(
                    req.file.path,
                    {
                        folder: "lms",
                        resource_type: "video",
                    }
                );

                if (result) {
                    updateFields["lectures.$.lecture.public_id"] =
                        result.public_id;
                    updateFields["lectures.$.lecture.secure_url"] =
                        result.secure_url;

                    fs.rm(`uploads/${req.file.filename}`);
                }
            } catch (error) {
                fs.rm(`uploads/${req.file.filename}`);
                return next(
                    new AppError(
                        error.message || "File not uploaded, please try again",
                        400
                    )
                );
            }
        }

        await Course.updateOne(
            {
                _id: courseid,
                "lectures._id": lectureid,
            },
            {
                $set: updateFields,
            }
        );

        res.status(200).json({
            success: true,
            message: "Lecture updated successfully",
        });
    } catch (error) {
        if (req.file) {
            fs.rm(`uploads/${req.file.filename}`);
        }
        return next(new AppError(error.message, 500));
    }
};

const deleteLecture = async (req, res, next) => {
    try {
        const { courseid, lectureid } = req.params;

        const course = await Course.findById(courseid);

        if (!course) {
            return next(new AppError("Course not found", 400));
        }

        const lecture = await Course.findOne(
            {
                _id: courseid,
                "lectures._id": lectureid,
            },
            {
                _id: 0,
                "lectures.$": 1,
            }
        );

        if (!lecture) {
            return next(new AppError("Lecture not found", 400));
        }

        const public_id = lecture.lectures[0].lecture.public_id;

        await cloudinary.v2.uploader.destroy(public_id);

        await Course.updateOne(
            { _id: courseid },
            { $pull: { lectures: { _id: lectureid } } }
        );

        course.numbersOfLectures = course.lectures.length;

        await course.save();

        res.status(200).json({
            success: true,
            message: "Lecture deleted successfully",
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

export {
    getAllCourses,
    getLecturesByCourseId,
    createCourse,
    updateCourse,
    removeCourse,
    addLectureToCourseById,
    deleteLecture,
}