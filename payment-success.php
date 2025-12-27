<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Successful - BookWise</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        .success-container {
            max-width: 600px;
            margin: 100px auto;
            text-align: center;
            padding: 40px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .success-icon {
            font-size: 80px;
            color: #409D69;
            margin-bottom: 20px;
        }
        .btn-home {
            display: inline-block;
            margin-top: 30px;
            padding: 12px 30px;
            background: #409D69;
            color: white;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 500;
        }
    </style>
</head>
<body style="background-color: #f7f7f7;">
    <div class="success-container">
        <i class="fas fa-check-circle success-icon"></i>
        <h1>Payment Successful!</h1>
        <p>Thank you for your purchase. 
            <?php if(isset($_GET['book_title'])): ?>
                Your order for <strong><?php echo htmlspecialchars($_GET['book_title']); ?></strong> has been placed successfully.
            <?php else: ?>
                Your order has been placed successfully.
            <?php endif; ?>
        </p>
        
        <?php if(isset($_GET['data'])): ?>
            <?php 
                $data = json_decode(base64_decode($_GET['data']), true);
                if($data):
            ?>
            <div style="margin-top: 20px; text-align: left; background: #f9f9f9; padding: 20px; border-radius: 8px;">
                <p><strong>Transaction ID:</strong> <?php echo $data['transaction_uuid']; ?></p>
                <p><strong>Amount Paid:</strong> Rs. <?php echo $data['total_amount']; ?></p>
                <p><strong>Status:</strong> <?php echo $data['status']; ?></p>
            </div>
            <?php endif; ?>
        <?php endif; ?>

        <a href="index.html" class="btn-home">Back to Homepage</a>
    </div>
</body>
</html>
