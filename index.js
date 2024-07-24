const {
  Connection,
  PublicKey,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} = require("@solana/web3.js");
const connection = new Connection("http://127.0.0.1:8899", "confirmed");
const walletBalance = async (publicKey) => {
  let balance = await connection.getBalance(new PublicKey(publicKey));
  return balance;
};

const transferSol = async () => {
  // Generate a new keypair
  const from = Keypair.generate();

  // Generate another Keypair (account we'll be sending to)
  const to = Keypair.generate();
  {
    let from_balance = await walletBalance(from.publicKey);
    console.log(
      `From wallet balance: ${parseInt(from_balance) / LAMPORTS_PER_SOL}`
    );
    let to_balance = await walletBalance(to.publicKey);
    console.log(
      `From wallet balance: ${parseInt(to_balance) / LAMPORTS_PER_SOL}`
    );
  }

  // Aidrop 2 SOL to Sender wallet
  console.log("Airdopping some SOL to Sender wallet!");
  const fromAirDropSignature = await connection.requestAirdrop(
    new PublicKey(from.publicKey),
    2 * LAMPORTS_PER_SOL
  );

  // Latest blockhash (unique identifer of the block) of the cluster
  let latestBlockHash = await connection.getLatestBlockhash();

  // Confirm transaction using the last valid block height (refers to its time)
  // to check for transaction expiration
  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: fromAirDropSignature,
  });

  console.log("Airdrop completed for the Sender account");
  {
    let from_balance = await walletBalance(from.publicKey);
    console.log(
      `From wallet balance: ${parseInt(from_balance) / LAMPORTS_PER_SOL}`
    );
    let to_balance = await walletBalance(to.publicKey);
    console.log(
      `From wallet balance: ${parseInt(to_balance) / LAMPORTS_PER_SOL}`
    );
  }

  // Send money from "from" wallet and into "to" wallet
  let transfer_amount = (await walletBalance(from.publicKey)) / 2;
  var transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: to.publicKey,
      lamports: transfer_amount,
    })
  );

  // Sign transaction
  var signature = await sendAndConfirmTransaction(connection, transaction, [
    from,
  ]);
  console.log("Signature is", signature);
  {
    let from_balance = await walletBalance(from.publicKey);
    console.log(
      `From wallet balance: ${parseInt(from_balance) / LAMPORTS_PER_SOL}`
    );
    let to_balance = await walletBalance(to.publicKey);
    console.log(
      `From wallet balance: ${parseInt(to_balance) / LAMPORTS_PER_SOL}`
    );
  }
};

transferSol();
