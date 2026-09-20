"""Small educational blockchain used to verify marketplace transactions."""

from dataclasses import dataclass
import hashlib
import json
from typing import Any


@dataclass(frozen=True)
class Block:
    index: int
    timestamp: str
    data: dict[str, Any]
    previous_hash: str
    hash: str


class LocalBlockchain:
    """Hash-linked blocks backed by the marketplace database."""

    @staticmethod
    def calculate_hash(data: dict[str, Any], previous_hash: str) -> str:
        payload = json.dumps(
            {"data": data, "previous_hash": previous_hash},
            sort_keys=True,
            separators=(",", ":"),
        )
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()

    @staticmethod
    def calculate_transaction_hash(
        transaction_id: str,
        buyer_id: str,
        seller_id: str,
        product_id: str,
        quantity: int,
        total_amount: float,
        timestamp: str,
        previous_hash: str,
    ) -> str:
        payload = "|".join([
            transaction_id,
            buyer_id,
            seller_id,
            product_id,
            str(quantity),
            str(total_amount),
            timestamp,
            previous_hash,
        ])
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()

    def verify_transaction(self, transaction: Any, expected_previous_hash: str) -> bool:
        return (
            transaction.previous_hash == expected_previous_hash
            and transaction.transaction_hash == self.calculate_transaction_hash(
                transaction.id,
                transaction.buyer_id,
                transaction.seller_id,
                transaction.product_id,
                transaction.quantity,
                transaction.total_amount,
                transaction.timestamp,
                transaction.previous_hash,
            )
        )

    def create_block(
        self,
        index: int,
        timestamp: str,
        data: dict[str, Any],
        previous_hash: str,
    ) -> Block:
        block_hash = self.calculate_hash(data, previous_hash)
        return Block(index, timestamp, data, previous_hash, block_hash)

    def verify_block(self, block: Block) -> bool:
        return block.hash == self.calculate_hash(block.data, block.previous_hash)

    def verify_chain(self, blocks: list[Block]) -> dict[str, Any]:
        expected_previous_hash = "GENESIS"

        for position, block in enumerate(blocks):
            if block.previous_hash != expected_previous_hash:
                return {
                    "valid": False,
                    "invalid_block": position + 1,
                    "reason": "Previous hash does not link to the preceding block",
                }

            if not self.verify_block(block):
                return {
                    "valid": False,
                    "invalid_block": position + 1,
                    "reason": "Block data does not match its transaction hash",
                }

            expected_previous_hash = block.hash

        return {
            "valid": True,
            "blocks": len(blocks),
            "message": "All transaction blocks are linked and valid",
        }
