import prisma from "../../../../packages/libs/prisma";

export const updateUserAnalytics = async (event: any) => {
    try {
        const existingData = await prisma.userAnalytics.findUnique({
            where: {userId: event.userId},
            select: {actions: true},
        })
        let updatedActions: any = existingData?.actions || []
        const actionExisits = updatedActions.some(
            (entry: any) =>
                entry.productId == event.productId && entry.action == event.action)
        //alway store 'product_view' for recomemmendations
        if (event.action == 'course_view') {
            updatedActions.push({
                productId: event?.productId,
                classId: event.classId,
                action: event.action,
                timestamp: new Date(),
            })
        } else if (["add_to_cart", "add_to_wishlist"].includes(event.action) && !actionExisits) {
            updatedActions.push({
                productId: event?.productId,
                classId: event.classId,
                action: event?.action,
                timestamp: new Date(),

            })
        }
        //remove 'add_to_cart' when "remove_from_cart" is triggered
        else if (event.action == 'remove_from_cart') {
            updatedActions = updatedActions.filter(
                (entry: any) => !(
                    entry.productId == event.productId &&
                    entry.action == "add_to_cart"
                )
            )
        }
        //keep only the last 100 actions (prevent storage overload)
        if (updatedActions.length > 100) {
            updatedActions.shift()
        }
        const extraFields: Record<string, any> = {}
        if (event.country) {
            extraFields.country = event.country
        }
        if (event.city) {
            extraFields.city = event.city
        }
        if (event.device) {
            extraFields.device = event.device
        }
        await prisma.userAnalytics.upsert({
            where: {userId: event.userId},
            update: {
                lastVisited: new Date(),
                actions: updatedActions,
                ...extraFields
            },
            create: {
                userId: event?.userId,
                lastVisited: new Date(),
                actions: updatedActions,
                ...extraFields
            }
        })
    } catch (error) {
        console.error(error)
    }
}


//also update product analytics
// export const updateProductAnalytics = async (event: any) => {
//     try {
//         if (!event.productId) return
//         //define update fields dynamically
//         const updateFields: any = {}
//         if (event.action == 'add_to_cart') {
//             updateFields.cartAdds = {increment: 1}
//         }
//         if (event.action == "remove_from_cart") {
//             updateFields.cartAdds = {decrement: 1}
//         }
//         if (event.action == 'add_to_wishlist') {
//             updateFields.wishListAdds = {increment: 1}
//         }
//         if (event.action == "remove_from_wishlist") {
//             updateFields.wishListAdds = {decrement: 1}
//         }
//         if (event.action == 'purchase') {
//             updateFields.purchases = {increment: 1}
//         }
//         await prisma.productAnalytics.upsert({
//             where: {productId: event.productId},
//             update: {
//                 lastVisited: new Date(),
//                 ...updateFields
//             },
//             create: {
//                 productId: event.productId,
//                 classId: event.classId || null,
//                 views: event.action == "course_view" ? 1 : 0,
//                 cartAdds: event.action == "add_to_cart" ? 1 : 0,
//                 wishListAdds: event.action == "add_to_wishlist" ? 1 : 0,
//                 purchases: event.action == "purchase" ? 1 : 0,
//                 lastViewedAt: new Date(),
//             }
//         })
//     } catch (error) {
//
//     }
// }
