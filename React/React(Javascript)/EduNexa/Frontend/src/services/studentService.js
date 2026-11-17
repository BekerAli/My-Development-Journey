import { students } from "../data/mockData";

export function searchStudentData(studentList, searchStudData) {
  const searchValue = searchStudData.toLowerCase().trim();

  return studentList.filter((stud) => {
    const fullName = `${stud.firstName} ${stud.lastName}`.toLowerCase();

    return (
      stud._id.toLowerCase().includes(searchValue) ||
      fullName.includes(searchValue) ||
      stud.email.toLowerCase().includes(searchValue)
    );
  });
}

export function filterStudentData(
  studentList,
  filterGrade = "All Grades",
  filterStatus = "All Statuses",
  filterGender = "All Genders",
) {
  const filteredData = studentList.filter((stud) => {
    return (
      (filterGrade === "All Grades" || stud.gradeLevel === filterGrade) &&
      (filterStatus === "All Statuses" || stud.status === filterStatus) &&
      (filterGender === "All Genders" || stud.gender === filterGender)
    );
  });

  return filteredData;
}



export function sortStudentData(studentList, sortOption) {
    const sortedData = [...studentList];

    switch (sortOption) {
        case "name-asc":
        return sortedData.sort((a, b) => {
            const nameA = `${a.firstName} ${a.lastName}`;
            const nameB = `${b.firstName} ${b.lastName}`;

            return nameA.localeCompare(nameB);
        });

        case "name-desc":
        return sortedData.sort((a, b) => {
            const nameA = `${a.firstName} ${a.lastName}`;
            const nameB = `${b.firstName} ${b.lastName}`;

            return nameB.localeCompare(nameA);
        });

        case "id-asc":
        return sortedData.sort((a, b) => a._id.localeCompare(b._id));

        case "id-desc":
        return sortedData.sort((a, b) => b._id.localeCompare(a._id));

        case "grade-asc":
        return sortedData.sort(
            (a, b) =>
            Number(a.gradeLevel.replace("Grade ", "")) -
            Number(b.gradeLevel.replace("Grade ", "")),
        );

        case "grade-desc":
        return sortedData.sort(
            (a, b) =>
            Number(b.gradeLevel.replace("Grade ", "")) -
            Number(a.gradeLevel.replace("Grade ", "")),
        );

        case "date-asc":
        return sortedData.sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        );

        case "date-desc":
        return sortedData.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );

        default:
        return sortedData;
    }
}
