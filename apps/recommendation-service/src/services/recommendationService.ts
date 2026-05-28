import {preProcessData} from "../utils/preProcessData";
import * as tf from "@tensorflow/tfjs-node"
import {getUserActivity} from "./fetch-user-activity";

const EMBEDDING_DIM = 50

interface UserAction {
    userId: string,
    courseId: string,
    actionType: "course-view" | "add_to_cart" | "add-to_wishlist" | "purchase",
}

interface Interaction {
    userId: string,
    courseId: string,
    actionType: UserAction["actionType"],
}

interface RecommendedCourses {
    courseId: string,
    score: number,
}

async function fetchUserActivity(userId: string): Promise<UserAction[]> {
    const userActions = await getUserActivity(userId);
    return Array.isArray(userActions)
        ? (userActions as unknown as UserAction[])
        : []
}

export const recommendCourses = async (userId: string, allCourses: any): Promise<string[]> => {
    const userActions: UserAction[] = await fetchUserActivity(userId);
    if (userActions.length == 0) {
        return []
    }
    const processedData = preProcessData(userActions, allCourses)
    if (!processedData || !processedData.interactions || !processedData.courses) {
        return []
    }
    const {interactions} = processedData as {
        interactions: Interaction[],
    };
    const userMap: Record<string, number> = {};
    const courseMap: Record<string, number> = {};
    let userCount = 0
    let courseCount = 0;
    interactions.forEach(({userId, courseId}) => {
        if (!(userId in userMa)p) {
            userMap[userId] = userCount++
        }
        if (!(courseId in courseMap)) {
            courseMap[courseId] = courseCount++
        }


    })
    //define odel input layer
    const userInput = tf.input({
        shape: [1],
        dtype: "int32"
    }) as tf.SymbolicTensor
    const courseInput = tf.input({
        shape: [1],
        dtype: "int32"
    }) as tf.SymbolicTensor
    //creae embedding layer (like lookup table) to learn the relationships
    const userEmbedding = tf.layers.embedding({
        inputDim: userCount,
        outputDim: EMBEDDING_DIM,
    }).apply(userInput) as tf.SymbolicTensor
    const courseEmbedding = tf.layers.embedding({
        inputDim: courseCount,
        outputDim: EMBEDDING_DIM,
    }).apply(courseInput) as tf.SymbolicTensor
    //flattern  the 2D embedding into 1D feature vector
    const userVector = tf.layers
        .flatten()
        .apply(userEmbedding) as tf.SymbolicTensor
    const courseVector = tf.layers
        .flatten()
        .apply(courseEmbedding) as tf.SymbolicTensor

    // Dot course combines user and course vector (user-course affinity)
    const merged = tf.layers
        .dot({axes: 1})
        .apply([userVector, courseVector])
//final layer :outputs probaility of interaction
    const output = tf.layers
        .dense({units: 1, activation: "sigmoid"})
        .apply(merged) as tf.SymbolicTensor
// compile the recommendation model
    const model = tf.model({
        inputs: [userInput, courseInput],
        outputs: output,
    })
    model.compile({
        optimizer: tf.train.adam(),
        loss: "binaryCrossentropy",
        metrics: ['accuracy'],
    })
    //convert user and course interactions into tensor for training
    const userTensor = tf.tensor1d(
        interactions.map(d => userMap[d.userId] ?? 0),
        "int32"
    )
    const courseTensor = tf.tensor1d(
        interactions.map(d => courseMap[d.courseId] ?? 0),
        "int32"
    )
    const weightLabels = tf.tensor2d(
        interactions.map((d: any) => {
            switch (d.actionType) {
                case "purchase":
                    return [1.0]
                case "add_to_cart":
                    return [0.7]
                case "add-to_wishlist":
                    return [0.5]
                case "course-view":
                    return [0.1]
                default:
                    return [0]
            }
        }),
        [interactions.length, 1]
    )
    await model.fit([userTensor, courseTensor], weightLabels, {
        epochs: 5,
        batchSize: 32,
    })
    const courseTesorAll = tf.tensor1d(Object.values(courseMap), "int32")
    const predictions = model.predict([
        tf.tensor1d([userMap[userId] ?? 0], "int32"),
        courseTesorAll,
    ]) as tf.Tensor
    const scores = (await predictions.array()) as number[]
    const recommendCourses: RecommendedCourses[] = Object.keys(courseMap)
        .map((courseId, index) => ({courseId, score: scores[index] ?? 0})
        )
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
    return recommendCourses.map((p) => p.courseId)
}