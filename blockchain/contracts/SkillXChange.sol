// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SkillXChange {
    uint256 public courseCounter;
    address public owner;
    
    struct Course {
        uint256 id;
        string title;
        string description;
        uint256 price;
        address instructor;
        string zoomLink;
        bool isActive;
        uint256 createdAt;
    }
    
    mapping(uint256 => Course) public courses;
    mapping(uint256 => mapping(address => bool)) public enrollments;
    mapping(address => uint256[]) public instructorCourses;
    mapping(address => uint256[]) public studentCourses;
    
    event CourseCreated(
        uint256 indexed courseId,
        string title,
        address indexed instructor,
        uint256 price
    );
    
    event CoursePurchased(
        uint256 indexed courseId,
        address indexed student,
        address indexed instructor,
        uint256 price
    );
    
    event CourseDeactivated(uint256 indexed courseId);
    
    modifier onlyInstructor(uint256 _courseId) {
        require(courses[_courseId].instructor == msg.sender, "Only instructor can perform this action");
        _;
    }
    
    modifier courseExists(uint256 _courseId) {
        require(_courseId > 0 && _courseId <= courseCounter, "Course does not exist");
        _;
    }
    
    modifier courseActive(uint256 _courseId) {
        require(courses[_courseId].isActive, "Course is not active");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        courseCounter = 0;
    }
    
    function createCourse(
        string memory _title,
        string memory _description,
        uint256 _price,
        string memory _zoomLink
    ) external returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(bytes(_zoomLink).length > 0, "Zoom link cannot be empty");
        
        courseCounter++;
        
        courses[courseCounter] = Course({
            id: courseCounter,
            title: _title,
            description: _description,
            price: _price,
            instructor: msg.sender,
            zoomLink: _zoomLink,
            isActive: true,
            createdAt: block.timestamp
        });
        
        instructorCourses[msg.sender].push(courseCounter);
        
        emit CourseCreated(courseCounter, _title, msg.sender, _price);
        
        return courseCounter;
    }
    
    function purchaseCourse(uint256 _courseId) 
        external 
        payable 
        courseExists(_courseId) 
        courseActive(_courseId) 
    {
        Course memory course = courses[_courseId];
        
        require(msg.value >= course.price, "Insufficient payment");
        require(msg.sender != course.instructor, "Instructor cannot buy their own course");
        require(!enrollments[_courseId][msg.sender], "Already enrolled in this course");
        
        enrollments[_courseId][msg.sender] = true;
        studentCourses[msg.sender].push(_courseId);
        
        // Transfer payment to instructor
        payable(course.instructor).transfer(msg.value);
        
        emit CoursePurchased(_courseId, msg.sender, course.instructor, msg.value);
    }
    
    function getCourseZoomLink(uint256 _courseId) 
        external 
        view 
        courseExists(_courseId) 
        returns (string memory) 
    {
        Course memory course = courses[_courseId];
        
        require(
            enrollments[_courseId][msg.sender] || course.instructor == msg.sender,
            "You must purchase the course to access the Zoom link"
        );
        
        return course.zoomLink;
    }
    
    function getCourseInfo(uint256 _courseId) 
        external 
        view 
        courseExists(_courseId) 
        returns (
            uint256 id,
            string memory title,
            string memory description,
            uint256 price,
            address instructor,
            bool isActive,
            uint256 createdAt
        ) 
    {
        Course memory course = courses[_courseId];
        return (
            course.id,
            course.title,
            course.description,
            course.price,
            course.instructor,
            course.isActive,
            course.createdAt
        );
    }
    
    function isEnrolled(uint256 _courseId, address _student) 
        external 
        view 
        courseExists(_courseId) 
        returns (bool) 
    {
        return enrollments[_courseId][_student];
    }
    
    function getInstructorCourses(address _instructor) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return instructorCourses[_instructor];
    }
    
    function getStudentCourses(address _student) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return studentCourses[_student];
    }
    
    function getAllActiveCourses() 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256[] memory activeCourses = new uint256[](courseCounter);
        uint256 activeCount = 0;
        
        for (uint256 i = 1; i <= courseCounter; i++) {
            if (courses[i].isActive) {
                activeCourses[activeCount] = i;
                activeCount++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](activeCount);
        for (uint256 i = 0; i < activeCount; i++) {
            result[i] = activeCourses[i];
        }
        
        return result;
    }
    
    function deactivateCourse(uint256 _courseId) 
        external 
        courseExists(_courseId) 
        onlyInstructor(_courseId) 
    {
        courses[_courseId].isActive = false;
        emit CourseDeactivated(_courseId);
    }
    
    function getTotalCourses() external view returns (uint256) {
        return courseCounter;
    }
}