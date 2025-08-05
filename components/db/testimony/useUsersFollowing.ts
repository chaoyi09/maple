import { collection, getDocs, where, limit, startAfter, orderBy, QueryConstraint } from "firebase/firestore"
import { firestore } from "../../firebase"
import { nullableQuery } from "../common"
import { createTableHook } from "../createTableHook"
import { UserElement } from "../../EditProfilePage/FollowingTabComponents"

type Refinement = {
  uid: string
}

const initialRefinement = (uid: string): Refinement => ({
  uid
})

const useTable = createTableHook<UserElement, Refinement, unknown>({
  getPageKey: i => i.profileId,
  getItems: listUsersFollowing,
  name: "users following"
})

export function useUsersFollowing({ uid }: { uid: string }) {
  const { pagination, items, refine, refinement } = useTable(
    initialRefinement(uid)
  )

  return {
    pagination,
    items,
    refine
  }
}

function getWhere({ uid }: Refinement): QueryConstraint[] {
  return [
    where("uid", "==", uid),
    where("type", "==", "testimony")
  ]
}

async function listUsersFollowing(
  refinement: Refinement,
  limitCount: number,
  startAfterKey: unknown | null
): Promise<UserElement[]> {
  const subscriptionRef = collection(firestore, `/users/${refinement.uid}/activeTopicSubscriptions/`)
  const result = await getDocs(
    nullableQuery(
      subscriptionRef,
      ...getWhere(refinement),
      orderBy("profileId"),
      limit(limitCount),
      startAfterKey !== null && startAfter(startAfterKey)
    )
  )
  
  const usersList: UserElement[] = []
  result.docs.forEach(doc => {
    const data = doc.data()
    if (data.userLookup) {
      usersList.push(data.userLookup)
    }
  })
  
  return usersList
}
