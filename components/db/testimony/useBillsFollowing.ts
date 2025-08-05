import { collection, getDocs, where, limit, startAfter, orderBy, QueryConstraint } from "firebase/firestore"
import { firestore } from "../../firebase"
import { nullableQuery } from "../common"
import { createTableHook } from "../createTableHook"
import { BillElement } from "../../EditProfilePage/FollowingTabComponents"

type Refinement = {
  uid: string
}

const initialRefinement = (uid: string): Refinement => ({
  uid
})

const useTable = createTableHook<BillElement, Refinement, unknown>({
  getPageKey: i => i.billId,
  getItems: listBillsFollowing,
  name: "bills following"
})

export function useBillsFollowing({ uid }: { uid: string }) {
  const { pagination, items, refine } = useTable(
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
    where("type", "==", "bill")
  ]
}

async function listBillsFollowing(
  refinement: Refinement,
  limitCount: number,
  startAfterKey: unknown | null
): Promise<BillElement[]> {
  const subscriptionRef = collection(firestore, `/users/${refinement.uid}/activeTopicSubscriptions/`)
  const result = await getDocs(
    nullableQuery(
      subscriptionRef,
      ...getWhere(refinement),
      orderBy("billId"),
      limit(limitCount),
      startAfterKey !== null && startAfter(startAfterKey)
    )
  )
  
  const billList: BillElement[] = []
  result.docs.forEach(doc => {
    const data = doc.data()
    if (data.billLookup) {
      billList.push(data.billLookup)
    }
  })
  
  return billList
}
