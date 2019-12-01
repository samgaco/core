SELECT generator_public_key,
       SUM ("total_fee") AS "total_fees",
       SUM ("removed_fee") AS "removed_fees",
       SUM ("reward") AS "total_rewards",
       SUM ("top_reward") AS "total_top_rewards",
       COUNT ("total_amount") AS "total_produced"
FROM blocks
GROUP BY "generator_public_key"
