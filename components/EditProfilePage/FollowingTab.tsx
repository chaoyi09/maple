import { useTranslation } from "next-i18next"
import { useState } from "react"
import { useAuth } from "../auth"
import { Stack } from "../bootstrap"
import { TitledSectionCard } from "../shared"
import UnfollowItem, { UnfollowModalConfig } from "./UnfollowModal"
import { FollowedItem } from "./FollowingTabComponents"
import { deleteItem } from "components/shared/FollowingQueries"
import { useBillsFollowing, useUsersFollowing } from "../db"
import { PaginationButtons } from "../table"

export function FollowingTab({ className }: { className?: string }) {
  const { user } = useAuth()
  const uid = user?.uid

  const [unfollow, setUnfollow] = useState<UnfollowModalConfig | null>(null)
  const close = () => setUnfollow(null)

  const billsFollowing = useBillsFollowing({ uid: uid || "" })
  const usersFollowing = useUsersFollowing({ uid: uid || "" })

  const handleUnfollowClick = async (unfollow: UnfollowModalConfig | null) => {
    if (!unfollow || !unfollow.typeId) {
      console.error(
        "handleUnfollowClick was called but unfollow or unfollow.typeId is undefined"
      )
      return
    }

    try {
      await deleteItem({ uid, unfollowItem: unfollow })
    } catch (error: any) {
      console.log(error.message)
    }

    setUnfollow(null)
  }

  const { t } = useTranslation("editProfile")

  return (
    <>
      <TitledSectionCard className={className}>
        <div className={`mx-4 mt-3 d-flex flex-column gap-3`}>
          <Stack>
            <h2>{t("follow.bills")}</h2>
            {billsFollowing.items.result?.map((element, index: number) => (
              <FollowedItem
                key={index}
                index={index}
                element={element}
                setUnfollow={setUnfollow}
                type={"bill"}
              />
            ))}
            {billsFollowing.pagination && (
              <PaginationButtons pagination={billsFollowing.pagination} />
            )}
          </Stack>
        </div>
      </TitledSectionCard>
      <TitledSectionCard className={`${className}`}>
        <div className={`mx-4 mt-3 d-flex flex-column gap-3`}>
          <Stack>
            <h2 className="pb-3">{t("follow.orgs")}</h2>
            {usersFollowing.items.result?.map((element, index: number) => (
              <FollowedItem
                key={index}
                index={index}
                element={element}
                setUnfollow={setUnfollow}
                type={"org"}
              />
            ))}
            {usersFollowing.pagination && (
              <PaginationButtons pagination={usersFollowing.pagination} />
            )}
          </Stack>
        </div>
      </TitledSectionCard>
      <UnfollowItem
        handleUnfollowClick={handleUnfollowClick}
        onHide={close}
        onUnfollowClose={() => setUnfollow(null)}
        show={!!unfollow}
        unfollowItem={unfollow}
      />
    </>
  )
}
