export const preProcessData =
    (userActions: any, courses: courses) => {
    const interactions: any = []
    userActions.forEach((action: any) => {
        interactions.push({
            userId: action.userId,
            courseId: action.courseId,
            actionType: action.actionType,
        })
    })
    return {interactions, courses}
}
